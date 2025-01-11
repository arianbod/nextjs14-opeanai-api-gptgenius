import React, { useState, memo, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ArrowUp, Camera, Paperclip, X, Upload, ImageIcon } from 'lucide-react';
import TextInputComponent from './TextInputComponent';
import FileUploadComponent from './FileUploadComponent';
import FilePreviewComponent, { IMAGE_TYPES } from './FilePreviewComponent';
import { useChat } from '@/context/ChatContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslations } from '@/context/TranslationContext';

/**
 * Detect RTL text
 */
const isRTLText = (text) => {
	if (!text || typeof text !== 'string') return false;
	const rtlRegex =
		/[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
	return rtlRegex.test(text.trim()[0]);
};

/**
 * Detect language
 */
const detectLanguage = (text) => {
	if (!text || typeof text !== 'string') return 'default';
	const persianRegex = /[\u0600-\u06FF]/;
	const arabicRegex = /[\u0627-\u064A]/;

	if (persianRegex.test(text)) return 'persian';
	if (arabicRegex.test(text)) return 'arabic';
	return 'default';
};

/**
 * Keywords for an image prompt
 */
const imageKeywords = [
	'generate image',
	'generate photo',
	'create image',
	'make image',
	'draw',
	'generate picture',
	'create picture',
	'generate a picture',
	'create an image',
	'generate an image',
	'draw a picture',
	'dall-e',
];

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
	const [isDragging, setIsDragging] = useState(false);
	const [showUnsupportedAlert, setShowUnsupportedAlert] = useState(false);
	const [textDirection, setTextDirection] = useState('ltr');
	const [textLanguage, setTextLanguage] = useState('default');

	const { activeChat, forceImageGeneration, setForceImageGeneration } =
		useChat();

	const { isRTL, dict } = useTranslations();

	const allowed = activeChat?.modelAllowed || {
		send: { text: true, file: false, image: false },
		receive: { text: true, file: false, image: false },
	};

	// Real-time “Want an image?” prompt
	const [showRealTimePrompt, setShowRealTimePrompt] = useState(false);
	// We'll store a reference to the 20-second timer that auto-hides the prompt
	const hidePromptTimerRef = useRef(null);

	// For the textarea
	const textareaRef = useRef(null);

	// =============== Effects ===============

	// On each keystroke, detect language + text direction
	useEffect(() => {
		const rtl = isRTLText(inputText);
		const lang = detectLanguage(inputText);
		setTextDirection(rtl ? 'rtl' : 'ltr');
		setTextLanguage(lang);
	}, [inputText]);

	// Check for image keywords
	useEffect(() => {
		const lower = inputText.toLowerCase();
		const foundImageWord = imageKeywords.some((k) => lower.includes(k));
		const canGenerateImages = allowed.send.image;

		if (foundImageWord && canGenerateImages) {
			setShowRealTimePrompt(true);
			// If the prompt is shown, start/refresh a 20s timer to auto-dismiss
			resetOrStartTimer();
		} else {
			setShowRealTimePrompt(false);
			clearTimer();
			// If user typed keywords but removed them, reset forceImage
			if (forceImageGeneration) {
				setForceImageGeneration(false);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [inputText, allowed.send.image]);

	// =============== Timers ===============

	/**
	 * Clears old timer
	 */
	const clearTimer = useCallback(() => {
		if (hidePromptTimerRef.current) {
			clearTimeout(hidePromptTimerRef.current);
			hidePromptTimerRef.current = null;
		}
	}, []);

	/**
	 * Sets a 20-second timer to auto-hide the prompt if user doesn't click "Yes"
	 */
	const resetOrStartTimer = useCallback(() => {
		clearTimer();
		hidePromptTimerRef.current = setTimeout(() => {
			setShowRealTimePrompt(false);
			setForceImageGeneration(false);
		}, 20000);
	}, [clearTimer, setForceImageGeneration]);

	// Cleanup on unmount
	useEffect(() => {
		return () => clearTimer();
	}, [clearTimer]);

	// =============== Drag / Drop ===============
	const handleDragEnter = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (!allowed.send.file && !allowed.send.image) {
			setShowUnsupportedAlert(true);
			return;
		}
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

		if (!allowed.send.file && !allowed.send.image) {
			setShowUnsupportedAlert(true);
			return;
		}

		const files = e.dataTransfer.files;
		if (files?.length > 0) {
			const file = files[0];
			const isImage = file.type.startsWith('image/');
			if (isImage && !allowed.send.image) {
				setShowUnsupportedAlert(true);
				return;
			}
			if (!isImage && !allowed.send.file) {
				setShowUnsupportedAlert(true);
				return;
			}
			await onFileUpload(file);
		}
	};

	const handlePaste = async (e) => {
		if (!allowed.send.image) return;
		const items = e.clipboardData?.items;
		if (!items) return;

		for (const item of items) {
			if (item.type.startsWith('image/')) {
				e.preventDefault();
				const file = item.getAsFile();
				if (file) {
					await onFileUpload(file);
				}
				break;
			}
		}
	};

	// =============== Submitting ===============
	const onSubmit = (e) => {
		e.preventDefault();
		if (!allowed.send.text && !uploadedFile) {
			setShowUnsupportedAlert(true);
			return;
		}
		handleSubmit(e);
	};

	// =============== Clicking the form ===============
	const handleFormClick = (e) => {
		if (
			e.target.tagName.toLowerCase() === 'button' ||
			e.target.closest('button')
		) {
			return;
		}
		if (textareaRef.current) {
			textareaRef.current.focus();
		}
	};

	// =============== Shimmer for Pending State ===============
	// We'll add a CSS class with a shimmer animation if isPending is true
	const shimmerClass = isPending ? 'animate-shimmer' : '';

	// If we’re generating an image, add a subtle gradient border
	const imageModeStyles = forceImageGeneration
		? 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-[2px]'
		: '';

	// =============== Render ===============
	return (
		<form
			onSubmit={onSubmit}
			onPaste={handlePaste}
			className='px-4 w-full'
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
			onClick={handleFormClick}>
			<div className='max-w-3xl mx-auto'>
				{showUnsupportedAlert && (
					<Alert className='mb-2 bg-red-500/10 text-red-400 relative'>
						<AlertDescription>
							{dict.chatInterface.messageInput.modelDoesNotSupport ||
								'This model does not support that type of input.'}
						</AlertDescription>
						<button
							onClick={() => setShowUnsupportedAlert(false)}
							className='absolute right-2 top-2 text-red-400 hover:text-red-300'
							type='button'>
							<X className='w-4 h-4' />
						</button>
					</Alert>
				)}

				{/* The real-time prompt: minimal with only a "Yes" button */}
				{showRealTimePrompt && (
					<div
						className={`
      mb-2 px-3 py-2
      backdrop-blur-md
      bg-white/10
      border border-white/30
      rounded-md
      flex items-center
      justify-between
      text-gray-700 dark:text-gray-100
      transition-all
      duration-300
      shadow-md
    `}
						style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
						<span className='text-sm mr-2'>
							{dict.chatInterface?.imagePromptMessage ||
								'Looks like you might want an image.'}
						</span>
						<button
							type='button'
							onClick={() => {
								setForceImageGeneration(true);
								setShowRealTimePrompt(false);
								clearTimer(); // stop the 20s countdown
							}}
							className='border border-white/60 text-white hover:bg-white/20 px-3 py-1 rounded-full text-sm transition-all duration-200'
							title='Yes, switch to image generation mode'>
							Yes
						</button>
					</div>
				)}

				{/* The container for the input area */}
				<div
					className={`relative  rounded-3xl  min-h-[96px]  flex flex-col   ${
						isDragging
							? 'border-blue-500 dark:border-blue-500'
							: 'border-white/50'
					}
            transition-colors duration-200
            ${textLanguage === 'persian' ? 'font-persian' : ''}
            ${textLanguage === 'arabic' ? 'font-arabic' : ''}
            ${imageModeStyles}
            ${shimmerClass}
          `}
					dir={textDirection}
					style={{ overflow: 'hidden' }}>
					{/* Inner wrapper with the actual background, so the gradient border shows around it */}
					<div
						className={`
              ${
								forceImageGeneration
									? 'bg-[#2a2b36]/80 backdrop-blur-sm rounded-3xl'
									: 'bg-[#2a2b36] rounded-3xl'
							}
              flex flex-col
              transition-all duration-300
            `}>
						{isDragging && (
							<div className='absolute inset-0 bg-blue-500 bg-opacity-10 rounded-3xl flex items-center justify-center'>
								<div className='flex flex-col items-center gap-2 text-blue-500'>
									<Upload className='w-8 h-8 animate-bounce' />
									<p className='text-sm font-medium'>
										{dict.chatInterface.messageInput.dropFileMessage ||
											'Drop your file here'}
									</p>
								</div>
							</div>
						)}

						{/* If uploading a file, show progress */}
						{isUploading && (
							<div className='px-4 pt-2'>
								<div className='flex items-center gap-2 text-gray-300'>
									{uploadedFile && IMAGE_TYPES.includes(uploadedFile.type) ? (
										<Camera className='w-4 h-4' />
									) : (
										<Paperclip className='w-4 h-4' />
									)}
									<span
										className={`text-sm truncate flex-1 ${
											textDirection === 'rtl' ? 'text-right' : 'text-left'
										}`}>
										{uploadedFile && IMAGE_TYPES.includes(uploadedFile.type)
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
										className='text-gray-400 hover:text-white p-1'
										title='Cancel upload'>
										<X className='w-4 h-4' />
									</button>
								</div>
							</div>
						)}

						{/* Show file preview if any */}
						{!isUploading && uploadedFile && (
							<FilePreviewComponent
								file={uploadedFile}
								onRemove={onRemoveFile}
							/>
						)}

						{/* If we can send text, render the text input */}
						{allowed.send.text && (
							<TextInputComponent
								ref={textareaRef}
								inputText={inputText}
								setInputText={setInputText}
								handleSubmit={handleSubmit}
								isPending={isPending}
								disabled={disabled}
								msgLen={msgLen}
								modelName={modelName}
								uploadedFile={uploadedFile}
								isUploading={isUploading}
							/>
						)}

						{/* Action buttons row:
                - LEFT: upload, image toggle
                - RIGHT: send
            */}
						<div className='flex items-center p-3 pt-0 justify-between'>
							<div className='flex items-center gap-2'>
								{/* Upload / file button(s) */}
								{(allowed.send.file || allowed.send.image) && (
									<FileUploadComponent
										onFileUpload={onFileUpload}
										isUploading={isUploading}
										onCancelUpload={onCancelUpload}
										handleDragEnter={handleDragEnter}
										handleDragLeave={handleDragLeave}
										handleDragOver={handleDragOver}
										handleDrop={handleDrop}
										isDragging={isDragging}
										accept={`${allowed.send.image ? 'image/*,' : ''}${
											allowed.send.file ? '*' : ''
										}`}
									/>
								)}

								{/* Force image toggle */}
								{allowed.send.image && (
									<button
										type='button'
										onClick={() =>
											setForceImageGeneration(!forceImageGeneration)
										}
										className={`
                      p-2 rounded-full transition-all duration-200
                      ${
												forceImageGeneration
													? 'bg-blue-600 text-white'
													: 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
											}
                    `}
										title={
											forceImageGeneration
												? 'Turn OFF image generation'
												: 'Force ON image generation'
										}>
										<ImageIcon className='w-5 h-5' />
									</button>
								)}
							</div>

							{/* Send button on the right side */}
							<button
								type='submit'
								className={`p-2 rounded-full transition-all duration-200 
                  ${
										isPending ||
										disabled ||
										(!inputText.trim() && !uploadedFile) ||
										isUploading ||
										(!allowed.send.text && !uploadedFile)
											? 'text-gray-500 bg-gray-700/50 cursor-not-allowed'
											: 'text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 shadow-lg'
									}
                `}
								disabled={
									isPending ||
									disabled ||
									(!inputText.trim() && !uploadedFile) ||
									isUploading ||
									(!allowed.send.text && !uploadedFile)
								}
								aria-label='Send Message'
								title={
									forceImageGeneration
										? 'Send as an image request'
										: 'Send as text/message'
								}>
								{forceImageGeneration ? (
									<Camera className='w-6 h-6' />
								) : (
									<ArrowUp className='w-6 h-6' />
								)}
							</button>
						</div>

						{/* Footer message */}
						<div className='text-center w-full text-[11px] text-white/70 py-1 font-medium'>
							<h2 style={{ direction: `${isRTL ? 'rtl' : 'ltr'}` }}>
								{dict.chatInterface.messageInput.footerMessage ||
									'Powered by your custom AI solution'}
							</h2>
						</div>
					</div>
				</div>
			</div>

			{/* Shimmer animation CSS - can be placed globally or here */}
			<style jsx>{`
				@keyframes shimmer {
					0% {
						background-position: -500px 0;
					}
					100% {
						background-position: 500px 0;
					}
				}
				.animate-shimmer {
					background: linear-gradient(
						to right,
						rgba(255, 255, 255, 0.07) 4%,
						rgba(255, 255, 255, 0.14) 25%,
						rgba(255, 255, 255, 0.07) 36%
					);
					background-size: 1000px 100%;
					animation: shimmer 2s infinite linear;
				}
			`}</style>
		</form>
	);
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
