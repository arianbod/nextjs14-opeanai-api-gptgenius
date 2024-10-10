import React, { useRef, useEffect, useState } from 'react';
import { FiSend } from 'react-icons/fi';

const MessageInput = ({
	inputText,
	setInputText,
	handleSubmit,
	isPending,
	isDisabled,
	msgLen,
}) => {
	const textareaRef = useRef(null);
	const [maxHeight, setMaxHeight] = useState('none');
	const [isMobileDevice, setIsMobileDevice] = useState(false);

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
			setIsMobileDevice(isMobile());
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
		if (e.key === 'Enter') {
			if (isMobileDevice) {
				// On mobile, always allow new line
				return;
			} else {
				// On desktop, submit on Enter, new line on Shift+Enter
				if (!e.shiftKey) {
					e.preventDefault();
					handleSubmit(e);
				}
			}
		}
	};

	const onSubmit = (e) => {
		e.preventDefault();
		handleSubmit(e);
		// Note: We don't clear the input here as it's managed by the parent component
	};

	return (
		<form
			onSubmit={onSubmit}
			className={msgLen > 0 && `fixed bottom-0 mx-auto  z-20 w-full max-w-3xl`}>
			<div className='flex items-end gap-2 '>
				<div className='relative flex-1 pr-1 '>
					<textarea
						ref={textareaRef}
						value={inputText}
						onChange={(e) => setInputText(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder='Type your message here...'
						className='w-full p-3 px-6 rounded-3xl resize-none overflow-y-auto focus:outline-none focus:ring-2 focus:ring-blue-500 transition-[height] duration-200 ease-in-out font-sans text-base leading-relaxed'
						style={{
							maxHeight: maxHeight,
							minHeight: '3rem',
							height: 'auto',
							transition: 'height 0.2s ease-in-out',
						}}
						disabled={isPending || isDisabled}
						rows={1}
					/>
					<button
						type='submit'
						className='absolute right-5 top-6 transform -translate-y-1/2 text-gray-400 cursor-pointer bg-slate-500 dark:bg-slate-800 p-2 rounded-full'
						disabled={isPending || isDisabled || inputText.trim() === ''}
						aria-label='Send Message'>
						<FiSend className='text-xl' />
					</button>
				</div>
			</div>
		</form>
	);
};

export default MessageInput;
