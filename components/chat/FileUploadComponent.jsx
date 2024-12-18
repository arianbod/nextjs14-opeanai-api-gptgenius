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

	const getImageDimensions = (file) => {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				resolve({ width: img.width, height: img.height });
			};
			img.onerror = () => {
				reject(new Error('Failed to load image'));
			};
			img.src = URL.createObjectURL(file);
		});
	};

	const handleFileValidationAndUpload = async (file) => {
		try {
			if (file.type.startsWith('image/')) {
				const dimensions = await getImageDimensions(file);
				if (dimensions.width > 1568 || dimensions.height > 1568) {
					toast.error('Image dimensions should not exceed 1568x1568 pixels');
					return;
				}

				const imageSizeInMegapixels =
					(dimensions.width * dimensions.height) / 1000000;
				if (imageSizeInMegapixels > 1.15) {
					toast.error(
						'Image size should not exceed 1.15 megapixels for optimal performance'
					);
					return;
				}
			}

			await onFileUpload(file);
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
