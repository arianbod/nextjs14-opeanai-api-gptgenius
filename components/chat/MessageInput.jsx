import React, { useState, memo, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
	ArrowUp,
	Camera,
	Paperclip,
	X,
	Upload,
	ImageIcon,
	Mic as MicIcon,
	StopCircle as StopIcon,
} from 'lucide-react';

import TextInputComponent from './TextInputComponent';
import FileUploadComponent from './FileUploadComponent';
import FilePreviewComponent, { IMAGE_TYPES } from './FilePreviewComponent';
import { useChat } from '@/context/ChatContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslations } from '@/context/TranslationContext';

// === Our voice hook
import useVoiceToText from '@/hooks/useVoiceToText';

// ====== Helper: Detect RTL text ======
const isRTLText = (text) => {
	if (!text || typeof text !== 'string') return false;
	const rtlRegex =
		/[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
	return rtlRegex.test(text.trim()[0]);
};

// ====== Helper: Detect language ======
const detectLanguage = (text) => {
	if (!text || typeof text !== 'string') return 'default';
	const persianRegex = /[\u0600-\u06FF]/;
	const arabicRegex = /[\u0627-\u064A]/;

	if (persianRegex.test(text)) return 'persian';
	if (arabicRegex.test(text)) return 'arabic';
	return 'default';
};

// ====== Image keywords ======
const imageKeywords = [
	'generate image',
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

	// Allowed features
	const allowed = activeChat?.modelAllowed || {
		send: { text: true, file: false, image: false },
		receive: { text: true, file: false, image: false },
	};

	// Real-time "image prompt" logic
	const [showRealTimePrompt, setShowRealTimePrompt] = useState(false);
	const hidePromptTimerRef = useRef(null);

	// For the textarea
	const textareaRef = useRef(null);

	// Voice to text (single toggle)
	const handleFinalVoiceText = useCallback(
		(finalText) => {
			setInputText((prev) => (prev ? prev + finalText : finalText));
		},
		[setInputText]
	);

	const { isListening, partialTranscript, startListening, stopListening } =
		useVoiceToText(handleFinalVoiceText);

	// Single function that toggles start/stop
	const toggleRecording = () => {
		if (!isListening) {
			startListening();
		} else {
			stopListening();
		}
	};

	// If user typed image keywords => show prompt
	useEffect(() => {
		const lower = inputText.toLowerCase();
		const foundImageWord = imageKeywords.some((k) => lower.includes(k));
		const canGenerateImages = allowed.send.image;
		if (foundImageWord && canGenerateImages) {
			setShowRealTimePrompt(true);
			resetOrStartTimer();
		} else {
			setShowRealTimePrompt(false);
			clearTimer();
			if (forceImageGeneration) {
				// setForceImageGeneration(false);
			}
		}
	}, [inputText, allowed.send.image, forceImageGeneration]);

	const clearTimer = useCallback(() => {
		if (hidePromptTimerRef.current) {
			clearTimeout(hidePromptTimerRef.current);
			hidePromptTimerRef.current = null;
		}
	}, []);

	const resetOrStartTimer = useCallback(() => {
		clearTimer();
		hidePromptTimerRef.current = setTimeout(() => {
			setShowRealTimePrompt(false);
			setForceImageGeneration(false);
		}, 20000);
	}, [clearTimer, setForceImageGeneration]);

	useEffect(() => {
		return () => clearTimer();
	}, [clearTimer]);

	// Shimmer + image highlight
	const shimmerClass = isPending ? 'animate-shimmer' : '';
	const imageModeStyles = forceImageGeneration
		? 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-[2px]'
		: '';

	// Determine text direction
	useEffect(() => {
		const rtl = isRTLText(inputText);
		const lang = detectLanguage(inputText);
		setTextDirection(rtl ? 'rtl' : 'ltr');
		setTextLanguage(lang);
	}, [inputText]);

	// Drag & Drop
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

	// Clipboard images
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

	// Submit
	const onSubmit = (e) => {
		e.preventDefault();
		if (!allowed.send.text && !uploadedFile) {
			setShowUnsupportedAlert(true);
			return;
		}
		handleSubmit(e);
	};

	// Click blank => focus
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

	// Decide button icon & label
	const micButtonIcon = isListening ? (
		<StopIcon className='w-5 h-5' />
	) : (
		<MicIcon className='w-5 h-5' />
	);
	const micButtonLabel = isListening ? 'Stop' : 'Mic';

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

				{showRealTimePrompt && (
					<div
						className={`
              mb-2 px-3 py-2
              backdrop-blur-md bg-white/10
              border border-white/30
              rounded-full flex items-center justify-start
              text-gray-700 dark:text-gray-100
              transition-all duration-300 shadow-md
            `}>
						<span className='text-sm mr-2'>
							{dict.chatInterface?.imagePromptMessage ||
								'Looks like you might want an image.'}
						</span>
						<button
							type='button'
							onClick={() => {
								setForceImageGeneration(true);
								setShowRealTimePrompt(false);
								clearTimer();
							}}
							className='border border-black/60 text-black dark:text-white dark:border-white-60 hover:bg-white/20 px-3 py-1 rounded-full text-sm transition-all duration-200'
							title='Yes, switch to image generation mode'>
							Yes
						</button>
					</div>
				)}

				<div
					className={`
            relative
            rounded-3xl
            min-h-[96px]
            flex flex-col
            dark:border-2
            ${
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
					dir={textDirection}>
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
							<div className='absolute inset-0 bg-blue-500 bg-opacity-10 rounded-3xl flex items-center justify-center z-50'>
								<div className='flex flex-col items-center gap-2 text-blue-500'>
									<Upload className='w-8 h-8 animate-bounce' />
									<p className='text-sm font-medium'>
										{dict.chatInterface.messageInput.dropFileMessage ||
											'Drop your file here'}
									</p>
								</div>
							</div>
						)}

						{/* If uploading => show progress */}
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

						{/* File preview */}
						{!isUploading && uploadedFile && (
							<FilePreviewComponent
								file={uploadedFile}
								onRemove={onRemoveFile}
							/>
						)}

						{/* If text allowed => text input */}
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

						{/* Show partial transcript overlay if isListening and partialTranscript */}
						{isListening && partialTranscript && (
							<div
								className={`
                  absolute bottom-full right-4 mb-2
                  px-4 py-2
                  bg-green-800/90 text-green-100
                  text-sm rounded-lg shadow-lg
                  animate-fadeIn
                `}>
								<strong>Voice:</strong> {partialTranscript}
							</div>
						)}

						{/* Buttons row */}
						<div className='flex items-center p-3 pt-0 justify-between'>
							<div className='flex items-center gap-2 relative z-50'>
								{/* File Upload */}
								{(allowed.send.file || allowed.send.image) && (
									<div className='relative group'>
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
											style={{ zIndex: 50 }}
										/>
										<span
											className={`
                        tooltip absolute left-1/2 -translate-x-1/2 top-full mt-1
                        px-2 py-1 text-sm rounded-md bg-black text-white
                        opacity-0 group-hover:opacity-100 pointer-events-none
                        transition-opacity
                      `}>
											{dict.chatInterface.messageInput.uploadTooltip ||
												'Upload file'}
										</span>
									</div>
								)}

								{/* Single toggle record button with wave animation if isListening */}
								<div className='relative group'>
									<button
										type='button'
										onClick={toggleRecording}
										className={`
                      p-2 rounded-full transition-all duration-200
                      ${
												isListening
													? 'bg-red-600 text-white recording-wave'
													: 'bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600'
											}
                    `}
										title='Start/Stop Recording'>
										{isListening ? (
											<StopIcon className='w-5 h-5' />
										) : (
											<MicIcon className='w-5 h-5' />
										)}
									</button>
									<span
										className={`
                      tooltip absolute left-1/2 -translate-x-1/2 top-full mt-1
                      px-2 py-1 text-sm rounded-md bg-black text-white opacity-0
                      group-hover:opacity-100 pointer-events-none transition-opacity
                    `}>
										{isListening
											? dict.chatInterface.messageInput.micActive ||
											  'Recording...'
											: dict.chatInterface.messageInput.micTooltip ||
											  'Voice to text'}
									</span>
								</div>

								{/* Force image toggle */}
								{allowed.send.image && (
									<div className='relative group'>
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
										<span
											className={`
                        tooltip absolute left-1/2 -translate-x-1/2 top-full mt-1
                        px-2 py-1 text-sm rounded-md bg-black text-white opacity-0
                        group-hover:opacity-100 pointer-events-none transition-opacity
                      `}>
											{dict.chatInterface.messageInput.imageToggleTooltip ||
												(forceImageGeneration
													? 'Image gen on'
													: 'Image gen off')}
										</span>
									</div>
								)}
							</div>

							{/* Send button */}
							<div className='relative group'>
								<button
									type='submit'
									className={`
                    p-2 rounded-full transition-all duration-200
                    ${
											isPending ||
											disabled ||
											(!inputText.trim() && !uploadedFile) ||
											isUploading ||
											(!allowed.send.text && !uploadedFile)
												? 'text-gray-500 bg-gray-700/50 cursor-not-allowed'
												: 'text-white bg-blue-600 hover:bg-blue-500 shadow-lg'
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
								<span
									className={`
                    tooltip absolute left-1/2 -translate-x-1/2 top-full mt-1
                    px-2 py-1 text-sm rounded-md bg-black text-white opacity-0
                    group-hover:opacity-100 pointer-events-none transition-opacity
                  `}>
									{forceImageGeneration
										? dict.chatInterface.messageInput.sendAsImage ||
										  'Send as image'
										: dict.chatInterface.messageInput.sendAsText ||
										  'Send message'}
								</span>
							</div>
						</div>

						{/* Footer text */}
						<div className='text-center w-full text-[11px] text-white/70 py-1 font-medium'>
							<h2 style={{ direction: `${isRTL ? 'rtl' : 'ltr'}` }}>
								{dict.chatInterface.messageInput.footerMessage ||
									'Powered by your custom AI solution'}
							</h2>
						</div>
					</div>
				</div>
			</div>

			{/* Additional CSS */}
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

				@keyframes fadeIn {
					0% {
						opacity: 0;
						transform: translateY(4px);
					}
					100% {
						opacity: 1;
						transform: translateY(0);
					}
				}
				.animate-fadeIn {
					animation: fadeIn 0.3s ease-in-out forwards;
				}

				.tooltip {
					white-space: nowrap;
					font-size: 0.85rem;
					z-index: 9999;
				}

				/* A purely cosmetic wave/pulse effect for the "recording" button. */
				@keyframes wave {
					0% {
						box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.4);
					}
					70% {
						box-shadow: 0 0 0 10px rgba(255, 0, 0, 0);
					}
					100% {
						box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
					}
				}

				.recording-wave {
					animation: wave 1.5s infinite;
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
