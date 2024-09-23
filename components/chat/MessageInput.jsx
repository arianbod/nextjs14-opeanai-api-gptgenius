import React, { useRef, useEffect, useState } from 'react';
import { FiSend } from 'react-icons/fi'; // Using Feather Icons for a sleek send icon
// If using a custom SVG, you can import it instead
// import { ReactComponent as CustomSendIcon } from './path-to-your-icon.svg';

// Optional: Import Inter font if installed via npm
// import '@fontsource/inter';
const MessageInput = ({
	inputText,
	setInputText,
	handleSubmit,
	isPending,
	isDisabled,
}) => {
	const textareaRef = useRef(null);
	const [maxHeight, setMaxHeight] = useState('none');

	// Function to determine if the device is mobile based on viewport width
	const isMobile = () => window.innerWidth < 768; // Tailwind's md breakpoint

	// Debounce function to limit how often a function can fire
	const debounce = (func, delay) => {
		let timer;
		return (...args) => {
			if (timer) clearTimeout(timer);
			timer = setTimeout(() => {
				func(...args);
			}, delay);
		};
	};

	// Function to set maxHeight based on viewport size
	const calculateMaxHeight = () => {
		const vh = window.innerHeight;
		if (isMobile()) {
			return `${vh * 0.5}px`; // 50% of viewport height on mobile
		} else {
			return `${vh * 0.3}px`; // 30% of viewport height on desktop
		}
	};

	// Function to resize the textarea
	const resizeTextarea = () => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = 'auto'; // Reset height to auto to get the correct scrollHeight
			const newHeight = Math.min(textarea.scrollHeight, parseInt(maxHeight));
			textarea.style.height = `${newHeight}px`;
		}
	};

	// Debounced version of resizeTextarea for performance
	const debouncedResizeTextarea = debounce(resizeTextarea, 100);

	// Update maxHeight and resize on mount and when window resizes
	useEffect(() => {
		const updateMaxHeight = () => {
			const newMaxHeight = calculateMaxHeight();
			setMaxHeight(newMaxHeight);
			resizeTextarea();
		};

		updateMaxHeight();

		const handleResize = debounce(updateMaxHeight, 100);
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Resize textarea when inputText changes
	useEffect(() => {
		resizeTextarea();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [inputText]);

	const handleKeyDown = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	const onSubmit = (e) => {
		e.preventDefault();
		handleSubmit(e);
		// Clear input and resize
		setInputText('');
		setTimeout(() => {
			resizeTextarea();
		}, 0);
	};

	return (
		<form
			onSubmit={onSubmit}
			className='border-t border-gray-200 bg-gray-100'>
			<div className='flex items-end gap-2 '>
				<div className='relative flex-1 pr-1 '>
					<textarea
						ref={textareaRef}
						value={inputText}
						onChange={(e) => setInputText(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder='Type your message here...'
						className='w-full p-3 rounded-3xl resize-none overflow-y-auto focus:outline-none focus:ring-2 focus:ring-blue-500 transition-[height] duration-200 ease-in-out font-sans text-base leading-relaxed'
						style={{
							maxHeight: maxHeight,
							minHeight: '3rem',
							height: 'auto',
							transition: 'height 0.2s ease-in-out',
						}}
						disabled={isPending || isDisabled}
						rows={1}
					/>
				</div>
				<button
					type='submit'
					className='bg-blue-500 mb-2 mr-1 text-white rounded-full h-10 w-10 flex items-center justify-center hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out'
					disabled={isPending || isDisabled || inputText.trim() === ''}
					aria-label='Send Message'>
					<FiSend className='text-xl' />
				</button>
			</div>
		</form>
	);
};

export default MessageInput;
