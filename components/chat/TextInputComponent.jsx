'use client';

import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const TextInputComponent = ({
	inputText,
	setInputText,
	handleSubmit,
	isPending,
	disabled,
	msgLen,
	modelName,
	uploadedFile,
	isUploading,
}) => {
	const textareaRef = useRef(null);
	const [maxHeight, setMaxHeight] = useState('none');
	const [isMobileDevice, setIsMobileDevice] = useState(false);
	const [cursorPosition, setCursorPosition] = useState(0);
	const [cursorCoordinates, setCursorCoordinates] = useState({
		top: 0,
		left: 0,
	});

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
				return;
			} else if (!currentIsMobile && !e.shiftKey) {
				e.preventDefault();
				handleSubmit(e);
			}
		}
	};

	let placeholder = isPending
		? `${modelName} is thinking...`
		: msgLen < 1
		? 'Start Writing Here!'
		: 'Write your response here';

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
	);
};

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

export default TextInputComponent;
