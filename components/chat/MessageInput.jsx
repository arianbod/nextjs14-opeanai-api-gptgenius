import React, { useRef, useEffect, useState, memo } from 'react';
import { ArrowUp, Paperclip, Camera, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const MessageInput = ({
	inputText,
	setInputText,
	handleSubmit,
	isPending,
	disabled,
	msgLen,
	modelName, // New prop for model name
	onFileUpload,
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
	const [selectedFile, setSelectedFile] = useState(null);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);
	const uploadControllerRef = useRef(null);

	const isMobile = () => {
		const width = window.innerWidth < 768;
		const userAgent =
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
				navigator.userAgent
			);
		return width || userAgent;
	};

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

	const handleKeyDown = (e) => {
		const currentIsMobile = isMobile();
		if (e.key === 'Enter') {
			if (currentIsMobile && e.shiftKey) {
				e.preventDefault();
				handleSubmit(e);
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

	const handleAttachmentClick = () => {
		setShowFileOptions(!showFileOptions);
	};

	const handleFileUpload = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		try {
			// Validate file size (10MB limit)
			if (file.size > 10 * 1024 * 1024) {
				toast.error('File size should be less than 10MB');
				return;
			}

			// Validate file type
			const allowedTypes = [
				'text/plain',
				'application/pdf',
				'application/msword',
				'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
				'text/csv',
				'application/vnd.ms-excel',
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			];

			if (!allowedTypes.includes(file.type)) {
				toast.error('Unsupported file type');
				return;
			}

			setSelectedFile(file);
			setIsUploading(true);
			setUploadProgress(0);

			// Create a new AbortController for this upload
			uploadControllerRef.current = new AbortController();

			// Convert file to base64 with progress
			const reader = new FileReader();

			reader.onloadstart = () => {
				toast.loading('Preparing file...');
			};

			reader.onprogress = (event) => {
				if (event.lengthComputable) {
					const progress = (event.loaded / event.total) * 100;
					setUploadProgress(progress);
				}
			};

			reader.onloadend = async () => {
				try {
					if (reader.result) {
						const base64String = reader.result.split(',')[1];

						await onFileUpload(
							{
								name: file.name,
								type: file.type,
								size: file.size,
								content: base64String,
							},
							uploadControllerRef.current.signal
						);

						toast.success('File uploaded successfully');
						setUploadProgress(100);

						// Clear the file after a delay
						setTimeout(() => {
							setIsUploading(false);
							setUploadProgress(0);
							setSelectedFile(null);
						}, 1000);
					}
				} catch (error) {
					if (error.name === 'AbortError') {
						toast.error('File upload cancelled');
					} else {
						toast.error('Error uploading file');
						console.error('File upload error:', error);
					}
					setIsUploading(false);
					setUploadProgress(0);
					setSelectedFile(null);
				}
			};

			reader.onerror = () => {
				toast.error('Error reading file');
				setIsUploading(false);
				setUploadProgress(0);
				setSelectedFile(null);
			};

			reader.readAsDataURL(file);
		} catch (error) {
			console.error('File handling error:', error);
			toast.error('Error processing file');
			setIsUploading(false);
			setUploadProgress(0);
			setSelectedFile(null);
		}

		setShowFileOptions(false);
	};

	const cancelUpload = () => {
		if (uploadControllerRef.current) {
			uploadControllerRef.current.abort();
			uploadControllerRef.current = null;
		}
		setIsUploading(false);
		setUploadProgress(0);
		setSelectedFile(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const removeFile = () => {
		setSelectedFile(null);
		setIsUploading(false);
		setUploadProgress(0);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
		onFileUpload(null);
	};

	let placeholder;
	if (isPending) {
		placeholder = `${modelName} is thinking...`;
	} else if (msgLen < 1) {
		placeholder = 'Start Writing Here!';
	} else {
		placeholder = 'Write your response here';
	}

	return (
		<form
			onSubmit={onSubmit}
			onClick={() => textareaRef.current?.focus()}
			className='fixed bottom-0 left-0 right-0 mx-auto lg:ml-40 px-4 w-full'>
			<div className='max-w-3xl mx-auto'>
				<div className='relative bg-[#2a2b36] rounded-3xl min-h-[96px] flex flex-col dark:border-2 border-white/50'>
					{/* File Upload Progress */}
					{selectedFile && (
						<div className='px-4 pt-2'>
							<div className='flex items-center gap-2 text-gray-300'>
								<Paperclip className='w-4 h-4' />
								<span className='text-sm truncate flex-1'>
									{selectedFile.name}
								</span>
								{isUploading ? (
									<>
										<div className='h-1 w-24 bg-gray-700 rounded-full overflow-hidden'>
											<div
												className='h-full bg-blue-500 transition-all duration-300'
												style={{ width: `${uploadProgress}%` }}
											/>
										</div>
										<button
											type='button'
											onClick={cancelUpload}
											className='text-gray-400 hover:text-white p-1'>
											<X className='w-4 h-4' />
										</button>
									</>
								) : (
									<button
										type='button'
										onClick={removeFile}
										className='text-gray-400 hover:text-white p-1'>
										<X className='w-4 h-4' />
									</button>
								)}
							</div>
						</div>
					)}

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

					<div className='flex justify-between items-center p-3 pt-0'>
						<div className='relative'>
							<button
								type='button'
								onClick={handleAttachmentClick}
								className='p-2 text-gray-400 hover:text-white rounded-full'
								disabled={isUploading}>
								{isUploading ? (
									<Loader className='w-6 h-6 animate-spin' />
								) : (
									<Paperclip className='w-6 h-6' />
								)}
							</button>

							{showFileOptions && (
								<div className='absolute bottom-12 left-0 bg-[#2a2b36] rounded-lg shadow-lg p-2 flex flex-col gap-2 border border-gray-700'>
									<button
										type='button'
										onClick={() => fileInputRef.current?.click()}
										className='flex items-center gap-2 p-2 hover:bg-[#3a3b46] rounded-lg text-gray-300'>
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
										className='flex items-center gap-2 p-2 hover:bg-[#3a3b46] rounded-lg text-gray-300'>
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
								accept='.txt,.pdf,.doc,.docx,.csv,.xlsx'
							/>
						</div>

						<button
							type='submit'
							className='p-2 text-gray-400 hover:text-white rounded-full disabled:opacity-70 bg-base-200 disabled:bg-base-200/50 transition-all duration-200'
							disabled={
								isPending ||
								disabled ||
								(!inputText.trim() && !selectedFile) ||
								isUploading
							}
							aria-label='Send Message'>
							<ArrowUp className='w-6 h-6' />
						</button>
					</div>
					<div className='text-center w-full text-[11px] text-white py-1 font-bold'>
						<h2>AI Models can make mistakes. Please double-check responses.</h2>
					</div>
				</div>
			</div>
		</form>
	);
};

export default memo(MessageInput);
