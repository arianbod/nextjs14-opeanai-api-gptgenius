import React, { useRef, useEffect, useState, memo } from 'react';
import { ArrowUp } from 'lucide-react';
import AnimatedPlaceholder from './AnimatedPlaceholder';

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

	// Improved mobile detection using both width and user agent
	const isMobile = () => {
		const width = window.innerWidth < 768;
		const userAgent =
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
				navigator.userAgent
			);
		return width || userAgent;
	};

	const debounce = (func, delay) => {
		let timer;
		return (...args) => {
			if (timer) clearTimeout(timer);
			timer = setTimeout(() => func(...args), delay);
		};
	};

	const calculateMaxHeight = () => {
		const vh = window.innerHeight;
		return isMobile() ? `${vh * 0.5}px` : `${vh * 0.3}px`;
	};

	const resizeTextarea = () => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		textarea.style.height = 'auto';
		const newHeight = Math.min(textarea.scrollHeight, parseInt(maxHeight));
		textarea.style.height = `${newHeight}px`;
	};

	// Handle window resize and initial setup
	useEffect(() => {
		const updateDimensions = () => {
			const newMaxHeight = calculateMaxHeight();
			setMaxHeight(newMaxHeight);
			setIsMobileDevice(isMobile());
			resizeTextarea();
		};

		updateDimensions();
		const debouncedUpdate = debounce(updateDimensions, 100);
		window.addEventListener('resize', debouncedUpdate);

		return () => window.removeEventListener('resize', debouncedUpdate);
	}, []);

	// Update textarea size when input changes
	useEffect(() => {
		resizeTextarea();
	}, [inputText, maxHeight]);

	// Auto-focus textarea on mount
	useEffect(() => {
		textareaRef.current?.focus();
	}, []);

	const handleKeyDown = (e) => {
		const currentIsMobile = isMobile(); // Real-time mobile check

		if (e.key === 'Enter') {
			if (currentIsMobile && e.shiftKey) {
				// Mobile: Shift+Enter to send
				e.preventDefault();
				handleSubmit(e);
			} else if (!currentIsMobile && !e.shiftKey) {
				// Desktop: Enter to send
				e.preventDefault();
				handleSubmit(e);
			}
			// Let other Enter combinations create a new line
		}
	};

	const onSubmit = (e) => {
		e.preventDefault();
		handleSubmit(e);
	};

	const placeholderSentences = [
		'Type your message here...',
		"What's on your mind?",
		'Ready to chat?',
		'Share your thoughts...',
		"Let's start a conversation!",
	];

	const baseTextareaStyles = {
		maxHeight,
		minHeight: '3rem',
		height: 'auto',
		transition: 'height 0.2s ease-in-out',
	};

	return (
		<form
			onSubmit={onSubmit}
			className={msgLen > 0 ? 'fixed bottom-5 z-20 w-full max-w-3xl' : ''}>
			<div className='flex items-end gap-2'>
				<div className='relative flex-1'>
					<div
						className={`
              p-0 m-0 flex bg-base-200 border-base-300 border-2 
              rounded-3xl resize-none transition-[height] duration-200 
              ease-in-out font-sans leading-relaxed
              ${msgLen < 1 && inputText.length < 1 ? '' : ''}
            `}
						style={baseTextareaStyles}>
						<textarea
							ref={textareaRef}
							value={inputText}
							onChange={(e) => setInputText(e.target.value)}
							onKeyDown={handleKeyDown}
							disabled={isPending || isDisabled}
							rows={1}
							className={`
                w-11/12 p-3 px-6 bg-transparent rounded-3xl 
                resize-none focus:outline-none transition-[height] 
                duration-200 ease-in-out font-sans leading-relaxed
                ${inputText.length < 1 ? 'animate-pulse' : ''}
              `}
							style={baseTextareaStyles}
						/>
						{inputText.length === 0 && (
							<div className='absolute left-6 top-1/2 transform -translate-y-1/2 pointer-events-none'>
								<AnimatedPlaceholder
									sentences={placeholderSentences}
									isActive={inputText.length === 0 && msgLen === 0}
									staticText='Write your response here'
								/>
							</div>
						)}
					</div>
					<button
						type='submit'
						className={`
              absolute right-2 top-1/2 transform -translate-y-1/2 
              cursor-pointer p-1 rounded-xl text-base-content 
              hover:bg-base-300 disabled:opacity-50
            `}
						disabled={isPending || isDisabled || inputText.trim() === ''}
						aria-label='Send Message'>
						<ArrowUp className='text-md' />
					</button>
				</div>
			</div>
		</form>
	);
};

export default memo(MessageInput);
