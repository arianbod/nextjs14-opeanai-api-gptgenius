import React, { useRef, useEffect, useState } from 'react';
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

	const isMobile = () => window.innerWidth < 768;

	const debounce = (func, delay) => {
		let timer;
		return (...args) => {
			if (timer) clearTimeout(timer);
			timer = setTimeout(() => {
				func(...args);
			}, delay);
		};
	};

	const calculateMaxHeight = () => {
		const vh = window.innerHeight;
		return isMobile() ? `${vh * 0.5}px` : `${vh * 0.3}px`;
	};

	const resizeTextarea = () => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = 'auto';
			const newHeight = Math.min(textarea.scrollHeight, parseInt(maxHeight));
			textarea.style.height = `${newHeight}px`;
		}
	};

	const debouncedResizeTextarea = debounce(resizeTextarea, 100);

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
	}, []);

	useEffect(() => {
		resizeTextarea();
	}, [inputText]);

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			if (isMobileDevice) {
				return;
			} else {
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
	};

	const placeholderSentences = [
		'Type your message here...',
		"What's on your mind?",
		'Ready to chat?',
		'Share your thoughts...',
		"Let's start a conversation!",
	];

	return (
		<form
			onSubmit={onSubmit}
			className={
				msgLen > 0 ? 'fixed bottom-0 mx-auto z-20 w-full max-w-3xl' : ''
			}>
			<div className='flex items-end gap-2'>
				<div className='relative flex-1'>
					<div
						className={`p-0 m-0 flex bg-base-200 border-base-300 border-2 rounded-3xl resize-none transition-[height] duration-200 ease-in-out font-sans leading-relaxed ${
							msgLen < 1 && inputText.length < 1
								? 'circular-animation animate-pulse'
								: ''
						}`}
						style={{
							maxHeight: maxHeight,
							minHeight: '3rem',
							height: 'auto',
							transition: 'height 0.2s ease-in-out',
						}}>
						<textarea
							ref={textareaRef}
							value={inputText}
							onChange={(e) => setInputText(e.target.value)}
							onKeyDown={handleKeyDown}
							disabled={isPending || isDisabled}
							rows={1}
							className={`w-11/12 p-3 px-6 bg-transparent rounded-3xl resize-none focus:outline-none transition-[height] duration-200 ease-in-out font-sans leading-relaxed ${
								inputText.length < 1 && 'animate-pulse'
							}`}
							style={{
								maxHeight: maxHeight,
								minHeight: '3rem',
								height: 'auto',
								transition: 'height 0.2s ease-in-out',
							}}
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
						className='absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer p-1 rounded-xl text-base-content hover:bg-base-300'
						disabled={isPending || isDisabled || inputText.trim() === ''}
						aria-label='Send Message'>
						<ArrowUp className='text-md' />
					</button>
				</div>
			</div>
			<style jsx>{`
				@keyframes circular-border {
					0% {
						clip-path: polygon(0% 100%, 0% 100%, 0% 100%);
					}
					25% {
						clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%);
					}
					50% {
						clip-path: polygon(0% 100%, 100% 100%, 100% 0%, 100% 0%);
					}
					75% {
						clip-path: polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%);
					}
					100% {
						clip-path: polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%);
					}
				}
				.circular-animation::before {
					content: '';
					position: absolute;
					top: -2px;
					left: -2px;
					right: -2px;
					bottom: -2px;
					border: 2px solid #3b82f6; /* Tailwind blue-500 */
					border-radius: 1.5rem;
					animation: circular-border 10s linear infinite;
				}
			`}</style>
		</form>
	);
};

export default MessageInput;
