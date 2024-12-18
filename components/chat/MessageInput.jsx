'use client';

import React, { useRef, useEffect, useState, memo } from 'react';
import { ArrowUp, Paperclip, Camera, X, Loader, Maximize2, Minimize2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

const FilePreview = ({ file, onRemove }) => {
    const [previewUrl, setPreviewUrl] = useState('');
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (file && IMAGE_TYPES.includes(file.type)) {
            const url = `data:${file.type};base64,${file.content}`;
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [file]);

    if (!file) return null;

    const isImage = IMAGE_TYPES.includes(file.type);

    const previewClass = expanded 
        ? 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75'
        : 'relative px-4 pt-2 group';

    const imageClass = expanded
        ? 'max-w-[90vw] max-h-[90vh] object-contain rounded-lg'
        : 'w-32 h-32 object-cover rounded-lg shadow-lg transition-transform hover:scale-105';

    return (
        <div className={previewClass}>
            <div className="relative">
                {isImage ? (
                    <>
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className={`${imageClass} ${loading ? 'opacity-0' : 'opacity-100'}`}
                            onLoad={() => setLoading(false)}
                        />
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
                                <Loader className="w-6 h-6 animate-spin text-blue-400" />
                            </div>
                        )}
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                type="button"
                                onClick={() => setExpanded(!expanded)}
                                className="p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75"
                            >
                                {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                            </button>
                            <button
                                type="button"
                                onClick={onRemove}
                                className="p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                        <Paperclip className="w-5 h-5 text-gray-400" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-200 truncate">{file.name}</p>
                            <p className="text-xs text-gray-400">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onRemove}
                            className="p-1 text-gray-400 hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>
            {expanded && (
                <button
                    type="button"
                    onClick={() => setExpanded(false)}
                    className="fixed top-4 right-4 p-2 bg-white bg-opacity-10 rounded-full text-white hover:bg-opacity-25"
                >
                    <X className="w-6 h-6" />
                </button>
            )}
        </div>
    );
};

const MessageInput = ({
	inputText,
	setInputText,
	handleSubmit,
	isPending,
	disabled,
	msgLen,
	modelName,
	onFileUpload,
	uploadProgress,
	isUploading,
	uploadedFile,
	onCancelUpload,
	onRemoveFile,
}) => {
	const textareaRef = useRef(null);
	const fileInputRef = useRef(null);
	const [maxHeight, setMaxHeight] = useState('none');
	const [isMobileDevice, setIsMobileDevice] = useState(false);
	const [showFileOptions, setShowFileOptions] = useState(false);
	const [cursorPosition, setCursorPosition] = useState(0);
	const [cursorCoordinates, setCursorCoordinates] = useState({
		top: 0,
		left: 0,
	});
	const [isDragging, setIsDragging] = useState(false);

	// Device detection
	const isMobile = () => {
		const width = window.innerWidth < 768;
		const userAgent =
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
				navigator.userAgent
			);
		return width || userAgent;
	};

	// Get image dimensions
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

	// Handle clipboard paste
	const handlePaste = async (e) => {
		const items = e.clipboardData?.items;
		if (!items) return;

		for (const item of items) {
			if (item.type.startsWith('image/')) {
				e.preventDefault();
				const file = item.getAsFile();
				if (file) {
					await handleFileValidationAndUpload(file);
				}
				break;
			}
		}
	};

	// Handle drag and drop
	const handleDragEnter = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = async (e) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const files = e.dataTransfer.files;
		if (files?.length > 0) {
			await handleFileValidationAndUpload(files[0]);
		}
	};

	// File validation and upload
	const handleFileValidationAndUpload = async (file) => {
		try {
			if (IMAGE_TYPES.includes(file.type)) {
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

	// Calculate height
	const calculateMaxHeight = () => {
		const vh = window.innerHeight;
		return isMobile() ? `${vh * 0.4}px` : `${vh * 0.25}px`;
	};

	const resizeTextarea = () => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		textarea.style.height = 'auto';
		const newHeight = Math.min(textarea.scrollHeight, parseInt(maxHeight));
		textarea.style.height = `${newHeight}px`;
	};

	const updateCursorPosition = () => {
		if (!textareaRef.current) return;

		const cursorPos = textareaRef.current.selectionStart;
		setCursorPosition(cursorPos);

		const measureDiv = document.createElement('div');
		measureDiv.style.cssText = window.getComputedStyle(
			textareaRef.current
		).cssText;
		measureDiv.style.height = 'auto';
		measureDiv.style.position = 'absolute';
		measureDiv.style.visibility = 'hidden';
		measureDiv.style.whiteSpace = 'pre-wrap';
		measureDiv.style.wordWrap = 'break-word';

		const textBeforeCursor = inputText.substring(0, cursorPos);
		const textLine = textBeforeCursor.split('\n').pop();

		measureDiv.textContent = textLine;
		document.body.appendChild(measureDiv);
		const textWidth = measureDiv.offsetWidth;
		document.body.removeChild(measureDiv);

		const computedStyle = window.getComputedStyle(textareaRef.current);
		const paddingLeft = parseInt(computedStyle.paddingLeft);
		const paddingTop = parseInt(computedStyle.paddingTop);
		const lineHeight = parseInt(computedStyle.lineHeight);
		const lines = textBeforeCursor.split('\n').length;

		setCursorCoordinates({
			left: paddingLeft + (textWidth % textareaRef.current.offsetWidth) + 10,
			top: paddingTop + (lines - 1) * lineHeight,
		});
	};

	// Effects
	useEffect(() => {
		const updateDimensions = () => {
			const newMaxHeight = calculateMaxHeight();
			setMaxHeight(newMaxHeight);
			setIsMobileDevice(isMobile());
			resizeTextarea();
		};

		updateDimensions();
		window.addEventListener('resize', updateDimensions);
		return () => window.removeEventListener('resize', updateDimensions);
	}, []);

	useEffect(() => {
		resizeTextarea();
		updateCursorPosition();
	}, [inputText, maxHeight]);

	useEffect(() => {
		textareaRef.current?.focus();
	}, []);

	// Key handlers
	const handleKeyDown = (e) => {
		const currentIsMobile = isMobile();
		if (e.key === 'Enter') {
			if (currentIsMobile && e.shiftKey) {
				return;
			} else if (!currentIsMobile && !e.shiftKey) {
				e.preventDefault();
				handleSubmit(e);
			}
		}
	};

	const onSubmit = (e) => {
		e.preventDefault();
		handleSubmit(e);
	};

	// Button handlers
	const handleAttachmentClick = () => {
		setShowFileOptions(!showFileOptions);
	};

	const handleFileUpload = async (e) => {
		const file = e.target.files[0];
		if (!file) return;
		await handleFileValidationAndUpload(file);
	};

	let placeholder = isPending
		? `${modelName} is thinking...`
		: msgLen < 1
		? 'Start Writing Here!'
		: 'Write your response here';

	return (
		<form
			onSubmit={onSubmit}
			onClick={() => textareaRef.current?.focus()}
			className='fixed bottom-0 left-0 right-0 mx-auto lg:ml-40 px-4 w-full'
			onPaste={handlePaste}
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDragOver={handleDragOver}
			onDrop={handleDrop}>
			<div className='max-w-3xl mx-auto'>
				<div
					className={`relative bg-[#2a2b36] rounded-3xl min-h-[96px] flex flex-col dark:border-2 
                    ${
											isDragging
												? 'border-blue-500 dark:border-blue-500'
												: 'border-white/50'
										} 
                    transition-colors duration-200`}>
					{/* Drag overlay */}
					{isDragging && (
						<div className='absolute inset-0 bg-blue-500 bg-opacity-10 rounded-3xl flex items-center justify-center'>
							<div className='flex flex-col items-center gap-2 text-blue-500'>
								<Upload className='w-8 h-8 animate-bounce' />
								<p className='text-sm font-medium'>Drop your file here</p>
							</div>
						</div>
					)}

					{/* Upload Progress */}
					{isUploading && (
						<div className='px-4 pt-2'>
							<div className='flex items-center gap-2 text-gray-300'>
								{IMAGE_TYPES.includes(uploadedFile?.type) ? (
									<Camera className='w-4 h-4' />
								) : (
									<Paperclip className='w-4 h-4' />
								)}
								<span className='text-sm truncate flex-1'>
									{IMAGE_TYPES.includes(uploadedFile?.type)
										? 'Processing image...'
										: 'Uploading file...'}
								</span>
								<div className='h-1 w-24 bg-gray-700 rounded-full overflow-hidden'>
									<div
										className='h-full bg-blue-500 transition-all duration-300'
										style={{ width: `${uploadProgress}%` }}
									/>
								</div>
								<button
									type='button'
									onClick={onCancelUpload}
									className='text-gray-400 hover:text-white p-1'>
									<X className='w-4 h-4' />
								</button>
							</div>
						</div>
					)}

					{/* File Preview */}
					{!isUploading && uploadedFile && (
						<FilePreview
							file={uploadedFile}
							onRemove={onRemoveFile}
						/>
					)}

					{/* Text Input Area */}
					<div className='flex-1 p-4 relative'>
						<textarea
							ref={textareaRef}
							value={inputText}
							onChange={(e) => {
								setInputText(e.target.value);
								updateCursorPosition();
							}}
							onKeyUp={updateCursorPosition}
							onClick={updateCursorPosition}
							onKeyDown={handleKeyDown}
							disabled={isPending || disabled}
							rows={1}
							className='w-full bg-transparent text-white placeholder-gray-300
                                   resize-none focus:outline-none transition-all duration-200 
                                   ease-in-out font-sans leading-relaxed'
							style={{
								maxHeight,
								height: 'auto',
							}}
							placeholder={placeholder}
						/>

						{/* Cursor Animation */}
						{textareaRef.current && (
							<div
								className='absolute pointer-events-none'
								style={{
									left: `${cursorCoordinates.left}px`,
									top: `${cursorCoordinates.top}px`,
									transform: 'translateY(-8px)',
									transition: 'left 0.1s ease-out, top 0.1s ease-out',
								}}>
								<div className='relative'>
									<div className='w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce shadow-lg' />
									<div className='w-1.5 h-1.5 bg-blue-400 rounded-full absolute -bottom-1 left-0.5 opacity-50' />
								</div>
							</div>
						)}
					</div>

					{/* Action Buttons */}
					<div className='flex justify-between items-center p-3 pt-0'>
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

							{/* File Upload Options */}
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

							{/* Hidden File Input */}
							<input
								type='file'
								ref={fileInputRef}
								onChange={handleFileUpload}
								className='hidden'
								accept='.txt,.pdf,.doc,.docx,.csv,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.svg,.html,.htm,.js,.css,.json,.md'
							/>
						</div>

						{/* Submit Button */}
						<button
							type='submit'
							className={`p-2 rounded-full transition-all duration-200
                                ${
																	isPending ||
																	disabled ||
																	(!inputText.trim() && !uploadedFile) ||
																	isUploading
																		? 'text-gray-500 bg-gray-700/50 cursor-not-allowed'
																		: 'text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 shadow-lg'
																}`}
							disabled={
								isPending ||
								disabled ||
								(!inputText.trim() && !uploadedFile) ||
								isUploading
							}
							aria-label='Send Message'>
							<ArrowUp className='w-6 h-6' />
						</button>
					</div>

					{/* Footer Message */}
					<div className='text-center w-full text-[11px] text-white/70 py-1 font-medium'>
						<h2>AI Models can make mistakes. Please double-check responses.</h2>
					</div>
				</div>
			</div>
		</form>
	);
};

FilePreview.propTypes = {
	file: PropTypes.shape({
		name: PropTypes.string,
		type: PropTypes.string,
		size: PropTypes.number,
		content: PropTypes.string,
		extension: PropTypes.string,
		isText: PropTypes.bool,
	}),
	onRemove: PropTypes.func.isRequired,
};

MessageInput.propTypes = {
	inputText: PropTypes.string.isRequired,
	setInputText: PropTypes.func.isRequired,
	handleSubmit: PropTypes.func.isRequired,
	isPending: PropTypes.bool.isRequired,
	disabled: PropTypes.bool.isRequired,
	msgLen: PropTypes.number.isRequired,
	modelName: PropTypes.string.isRequired,
	onFileUpload: PropTypes.func.isRequired,
	uploadProgress: PropTypes.number,
	isUploading: PropTypes.bool,
	uploadedFile: PropTypes.shape({
		name: PropTypes.string,
		type: PropTypes.string,
		size: PropTypes.number,
		content: PropTypes.string,
		extension: PropTypes.string,
		isText: PropTypes.bool,
	}),
	onCancelUpload: PropTypes.func.isRequired,
	onRemoveFile: PropTypes.func.isRequired,
};

MessageInput.defaultProps = {
	uploadProgress: 0,
	isUploading: false,
	uploadedFile: null,
};

export default memo(MessageInput);