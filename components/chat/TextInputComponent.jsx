'use client';

import React, { forwardRef, useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslations } from '@/context/TranslationContext';

/**
 * Updated helper function to detect if the line should be RTL.
 * If there's no text, it returns the user's default preference (defaultIsRTL).
 * Otherwise, it checks if the first character is from an RTL range.
 */
const isRTLLine = (text, defaultIsRTL) => {
	if (!text || !text.trim()) {
		// If there's no text, fallback to user’s default preference
		return defaultIsRTL;
	}

	const rtlRegex =
		/[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
	return rtlRegex.test(text.trim()[0]);
};

/** Helper function to detect language */
const detectLanguage = (text) => {
	if (!text || typeof text !== 'string') return 'default';
	const persianRegex = /[\u0600-\u06FF]/;
	const arabicRegex = /[\u0627-\u064A]/;

	if (persianRegex.test(text)) return 'persian';
	if (arabicRegex.test(text)) return 'arabic';
	return 'default';
};

const TextInputComponent = forwardRef(
	(
		{
			inputText,
			setInputText,
			handleSubmit,
			isPending,
			disabled,
			msgLen,
			modelName,
			uploadedFile,
			isUploading,
		},
		ref
	) => {
		const { dict, isRTL } = useTranslations();
		const textareaRef = ref || useRef(null);

		// States
		const [maxHeight, setMaxHeight] = useState('none');
		const [isMobileDevice, setIsMobileDevice] = useState(false);
		const [cursorPosition, setCursorPosition] = useState(0);
		const [cursorCoordinates, setCursorCoordinates] = useState({
			top: 0,
			left: 0,
		});

		// Initialize direction to user preference (if isRTL is true, start with 'rtl')
		const [textDirection, setTextDirection] = useState(isRTL ? 'rtl' : 'ltr');
		const [textLanguage, setTextLanguage] = useState('default');

		/**
		 * Helper function to detect if device is mobile.
		 */
		const isMobile = () => {
			const width = window.innerWidth < 768;
			const userAgent =
				/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
					navigator.userAgent
				);
			return width || userAgent;
		};

		/**
		 * Calculate max height for the textarea, different on mobile vs. desktop.
		 */
		const calculateMaxHeight = () => {
			const vh = window.innerHeight;
			return isMobile() ? `${vh * 0.4}px` : `${vh * 0.25}px`;
		};

		/**
		 * Dynamically resize the textarea up to maxHeight.
		 */
		const resizeTextarea = () => {
			const textarea = textareaRef.current;
			if (!textarea) return;

			textarea.style.height = 'auto';
			const newHeight = Math.min(
				textarea.scrollHeight,
				parseInt(maxHeight, 10) || Infinity
			);
			textarea.style.height = `${newHeight}px`;
		};

		/**
		 * Update the cursor position in the text (for the bouncing cursor indicator).
		 */
		const updateCursorPosition = () => {
			if (!textareaRef.current) return;

			const cursorPos = textareaRef.current.selectionStart;
			setCursorPosition(cursorPos);

			// Create an offscreen measurement div
			const measureDiv = document.createElement('div');
			measureDiv.style.cssText = window.getComputedStyle(
				textareaRef.current
			).cssText;
			measureDiv.style.height = 'auto';
			measureDiv.style.position = 'absolute';
			measureDiv.style.visibility = 'hidden';
			measureDiv.style.whiteSpace = 'pre-wrap';
			measureDiv.style.wordWrap = 'break-word';

			// Get text up to current cursor
			const textBeforeCursor = inputText.substring(0, cursorPos);
			const textLine = textBeforeCursor.split('\n').pop();

			measureDiv.textContent = textLine;
			document.body.appendChild(measureDiv);

			// Measured width of the text up to cursor
			const textWidth = measureDiv.offsetWidth;
			document.body.removeChild(measureDiv);

			// Extract relevant styles
			const computedStyle = window.getComputedStyle(textareaRef.current);
			const paddingLeft = parseInt(computedStyle.paddingLeft, 10);
			const paddingRight = parseInt(computedStyle.paddingRight, 10);
			const paddingTop = parseInt(computedStyle.paddingTop, 10);
			const lineHeight = parseInt(computedStyle.lineHeight, 10);
			const lines = textBeforeCursor.split('\n').length;

			// If this line is RTL, position the cursor indicator from the right
			const isRtlLine = textDirection === 'rtl';
			setCursorCoordinates({
				left: isRtlLine
					? textareaRef.current.offsetWidth -
					  paddingRight -
					  (textWidth % textareaRef.current.offsetWidth) -
					  10
					: paddingLeft + (textWidth % textareaRef.current.offsetWidth) + 10,
				top: paddingTop + (lines - 1) * lineHeight,
			});
		};

		/**
		 * Update direction & language whenever `inputText` changes.
		 * - If there's no text, fallback to `isRTL`.
		 * - If there is text, detect from first character.
		 */
		useEffect(() => {
			const direction = isRTLLine(inputText, isRTL);
			setTextDirection(direction ? 'rtl' : 'ltr');

			const lang = detectLanguage(inputText);
			setTextLanguage(lang);
		}, [inputText, isRTL]);

		/**
		 * Set up event listeners for window resizing to recalc maxHeight & isMobile.
		 */
		useEffect(() => {
			const updateDimensions = () => {
				const newMaxHeight = calculateMaxHeight();
				setMaxHeight(newMaxHeight);
				setIsMobileDevice(isMobile());
				resizeTextarea();
			};

			updateDimensions();
			window.addEventListener('resize', updateDimensions);

			return () => {
				window.removeEventListener('resize', updateDimensions);
			};
		}, []);

		/**
		 * Resize & update cursor position if `inputText` or `maxHeight` changes.
		 */
		useEffect(() => {
			resizeTextarea();
			updateCursorPosition();
		}, [inputText, maxHeight]);

		/**
		 * Auto-focus the textarea on mount.
		 */
		useEffect(() => {
			textareaRef.current?.focus();
		}, []);

		/**
		 * Handle key presses.
		 * - Enter triggers handleSubmit if SHIFT is not pressed on desktop,
		 *   or SHIFT is pressed on mobile.
		 */
		const handleKeyDown = (e) => {
			const currentIsMobile = isMobile();
			if (e.key === 'Enter') {
				if (currentIsMobile && e.shiftKey) {
					// On mobile, SHIFT+Enter should produce a newline
					return;
				} else if (!currentIsMobile && !e.shiftKey) {
					// On desktop, Enter alone triggers submit
					e.preventDefault();
					handleSubmit(e);
				}
			}
		};

		/**
		 * Choose a placeholder.
		 */
		let placeholder;
		if (isPending) {
			placeholder = `${modelName} ${dict.chatInterface.messageInput.writingStatus.thinking} `;
		} else if (msgLen < 1) {
			placeholder =
				dict.chatInterface.messageInput.writingStatus.startYourMessageHere;
		} else {
			placeholder =
				dict.chatInterface.messageInput.writingStatus.writeYourResponseHere;
		}

		return (
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
					className={`
            w-full
            bg-transparent
            text-white
            placeholder-gray-300
            resize-none
            focus:outline-none
            transition-all
            duration-200
            ease-in-out
            leading-relaxed
            ${textLanguage === 'persian' ? 'font-persian' : ''}
            ${textLanguage === 'arabic' ? 'font-arabic' : ''}
            ${textDirection === 'rtl' ? 'text-right' : 'text-left'}
          `}
					style={{
						maxHeight,
						height: 'auto',
						direction: textDirection,
					}}
					placeholder={placeholder}
				/>

				{/* This is the bouncing cursor indicator (for demonstration). */}
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
		);
	}
);

TextInputComponent.displayName = 'TextInputComponent';

TextInputComponent.propTypes = {
	inputText: PropTypes.string.isRequired,
	setInputText: PropTypes.func.isRequired,
	handleSubmit: PropTypes.func.isRequired,
	isPending: PropTypes.bool.isRequired,
	disabled: PropTypes.bool.isRequired,
	msgLen: PropTypes.number.isRequired,
	modelName: PropTypes.string.isRequired,
	uploadedFile: PropTypes.object,
	isUploading: PropTypes.bool.isRequired,
};

TextInputComponent.defaultProps = {
	uploadedFile: null,
	isUploading: false,
};

export default TextInputComponent;
