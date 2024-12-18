'use client';

import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Loader, Paperclip, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const FileUploadComponent = ({
	onFileUpload,
	isUploading,
	onCancelUpload,
	handleDragEnter,
	handleDragLeave,
	handleDragOver,
	handleDrop,
	isDragging,
}) => {
	const fileInputRef = useRef(null);
	const [showFileOptions, setShowFileOptions] = useState(false);

	const resizeImage = async (file) => {
		return new Promise((resolve) => {
			const img = new Image();
			const MAX_DIMENSION = 1500; // Maximum dimension allowed
			const MAX_FILE_SIZE = 1024 * 1024; // 1MB target size
			let quality = 0.9;

			img.onload = () => {
				let width = img.width;
				let height = img.height;
				const aspectRatio = width / height;
				let needsResize = false;

				// Check if dimensions exceed max allowed
				if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
					needsResize = true;
					if (width > height) {
						width = MAX_DIMENSION;
						height = Math.round(width / aspectRatio);
					} else {
						height = MAX_DIMENSION;
						width = Math.round(height * aspectRatio);
					}
				}

				const canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0, width, height);

				// Function to create blob with specific quality
				const createBlob = (q) => {
					return new Promise((resolveBlob) => {
						canvas.toBlob(
							(blob) => {
								resolveBlob(blob);
							},
							file.type,
							q
						);
					});
				};

				// Check and reduce file size if needed
				const processImage = async () => {
					let blob = await createBlob(quality);

					// If file is too large, reduce quality until we get under MAX_FILE_SIZE
					while (blob.size > MAX_FILE_SIZE && quality > 0.3) {
						needsResize = true;
						quality -= 0.1;
						blob = await createBlob(quality);
					}

					// If we still need to resize (either due to dimensions or file size)
					if (needsResize && blob) {
						const resizedFile = new File([blob], file.name, {
							type: file.type,
							lastModified: file.lastModified,
						});
						resolve(resizedFile);
					} else {
						resolve(file); // Return original if no resize needed
					}
				};

				processImage();
			};

			img.onerror = () => resolve(file); // Fallback to original if loading fails
			img.src = URL.createObjectURL(file);
		});
	};

	const handleFileValidationAndUpload = async (file) => {
		try {
			let fileToUpload = file;

			if (file.type.startsWith('image/')) {
				fileToUpload = await resizeImage(file);
			}

			await onFileUpload(fileToUpload);
			setShowFileOptions(false);
		} catch (error) {
			console.error('File handling error:', error);
			toast.error('Error processing file');
			setShowFileOptions(false);
		}
	};

	const handleAttachmentClick = () => {
		setShowFileOptions(!showFileOptions);
	};

	const handleFileUpload = async (e) => {
		const file = e.target.files[0];
		if (!file) return;
		await handleFileValidationAndUpload(file);
	};

	return (
		<div className='relative'>
			<button
				type='button'
				onClick={handleAttachmentClick}
				className='p-2 text-gray-400 hover:text-white rounded-full transition-colors duration-200
                         hover:bg-gray-700'
				disabled={isUploading}>
				{isUploading ? (
					<Loader className='w-6 h-6 animate-spin' />
				) : (
					<Paperclip className='w-6 h-6' />
				)}
			</button>

			{showFileOptions && (
				<div
					className='absolute bottom-12 left-0 bg-[#2a2b36] rounded-lg shadow-lg p-2 
                               flex flex-col gap-2 border border-gray-700 min-w-[160px]'>
					<button
						type='button'
						onClick={() => fileInputRef.current?.click()}
						className='flex items-center gap-2 p-2 hover:bg-[#3a3b46] rounded-lg 
                                 text-gray-300 transition-colors duration-200'>
						<Paperclip size={16} />
						<span>Upload File</span>
					</button>
					<button
						type='button'
						onClick={() => {
							if (fileInputRef.current) {
								fileInputRef.current.accept = 'image/*';
								fileInputRef.current.capture = 'environment';
								fileInputRef.current.click();
							}
						}}
						className='flex items-center gap-2 p-2 hover:bg-[#3a3b46] rounded-lg 
                                 text-gray-300 transition-colors duration-200'>
						<Camera size={16} />
						<span>Take Photo</span>
					</button>
				</div>
			)}

			<input
				type='file'
				ref={fileInputRef}
				onChange={handleFileUpload}
				className='hidden'
				accept='.txt,.pdf,.doc,.docx,.csv,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.svg,.html,.htm,.js,.css,.json,.md'
			/>
		</div>
	);
};

FileUploadComponent.propTypes = {
	onFileUpload: PropTypes.func.isRequired,
	isUploading: PropTypes.bool.isRequired,
	onCancelUpload: PropTypes.func.isRequired,
	handleDragEnter: PropTypes.func.isRequired,
	handleDragLeave: PropTypes.func.isRequired,
	handleDragOver: PropTypes.func.isRequired,
	handleDrop: PropTypes.func.isRequired,
	isDragging: PropTypes.bool.isRequired,
};

export default FileUploadComponent;
