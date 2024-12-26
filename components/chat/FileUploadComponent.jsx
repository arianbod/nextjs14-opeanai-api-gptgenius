'use client';

import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Loader, Paperclip, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

// Helper function to detect RTL
const isRTL = (text) => {
	if (!text || typeof text !== 'string') return false;
	const rtlRegex =
		/[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
	return rtlRegex.test(text.trim()[0]);
};

// Helper function to detect language
const detectLanguage = (text) => {
	if (!text || typeof text !== 'string') return 'default';
	const persianRegex = /[\u0600-\u06FF]/;
	const arabicRegex = /[\u0627-\u064A]/;

	if (persianRegex.test(text)) return 'persian';
	if (arabicRegex.test(text)) return 'arabic';
	return 'default';
};

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
	const menuRef = useRef(null);
	const [showFileOptions, setShowFileOptions] = useState(false);
	const [menuDirection, setMenuDirection] = useState('ltr');

	// Handle click outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setShowFileOptions(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const resizeImage = async (file) => {
		return new Promise((resolve) => {
			const img = new Image();
			const MAX_DIMENSION = 1500;
			const MAX_FILE_SIZE = 1024 * 1024;
			let quality = 0.9;

			img.onload = () => {
				let width = img.width;
				let height = img.height;
				const aspectRatio = width / height;
				let needsResize = false;

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

				const processImage = async () => {
					let blob = await createBlob(quality);

					while (blob.size > MAX_FILE_SIZE && quality > 0.3) {
						needsResize = true;
						quality -= 0.1;
						blob = await createBlob(quality);
					}

					if (needsResize && blob) {
						const resizedFile = new File([blob], file.name, {
							type: file.type,
							lastModified: file.lastModified,
						});
						resolve(resizedFile);
					} else {
						resolve(file);
					}
				};

				processImage();
			};

			img.onerror = () => resolve(file);
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

		// Update menu direction based on file name
		const rtl = isRTL(file.name);
		setMenuDirection(rtl ? 'rtl' : 'ltr');

		await handleFileValidationAndUpload(file);
	};

	return (
		<div
			className='relative'
			ref={menuRef}>
			<button
				type='button'
				onClick={handleAttachmentClick}
				className='p-2.5 text-gray-400 hover:text-white rounded-full transition-all duration-300
                         hover:bg-gray-700 hover:shadow-lg hover:shadow-gray-700/30 
                         active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
				disabled={isUploading}>
				{isUploading ? (
					<Loader className='w-5 h-5 animate-spin' />
				) : (
					<Paperclip className='w-5 h-5' />
				)}
			</button>

			{showFileOptions && (
				<div
					className={`absolute bottom-14 ${
						menuDirection === 'rtl' ? 'right-0' : 'left-0'
					}
                               bg-gray-800/95 backdrop-blur-sm rounded-xl 
                               shadow-xl p-3 flex flex-col gap-2 border border-gray-700/50 
                               min-w-[180px] transform transition-all duration-200 
                               animate-in slide-in-from-bottom-2`}
					dir={menuDirection}>
					<button
						type='button'
						onClick={() => fileInputRef.current?.click()}
						className={`flex items-center gap-3 p-2.5 hover:bg-gray-700/70 rounded-lg 
                                 text-gray-300 hover:text-white transition-all duration-200
                                 group relative ${
																		menuDirection === 'rtl'
																			? 'flex-row-reverse'
																			: ''
																	}`}>
						<Paperclip className='w-4 h-4 transition-transform group-hover:scale-110' />
						<span className='text-sm font-medium'>Upload File</span>
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
						className={`flex items-center gap-3 p-2.5 hover:bg-gray-700/70 rounded-lg 
                                 text-gray-300 hover:text-white transition-all duration-200
                                 group relative ${
																		menuDirection === 'rtl'
																			? 'flex-row-reverse'
																			: ''
																	}`}>
						<Camera className='w-4 h-4 transition-transform group-hover:scale-110' />
						<span className='text-sm font-medium'>Take Photo</span>
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
