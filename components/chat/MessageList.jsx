import React, { memo, useEffect, useRef, useCallback, useState } from 'react';
import { throttle } from 'lodash';
import { ArrowUp, ArrowDown, MessageSquare } from 'lucide-react';
import Message from './Message';

const MessageList = ({ messages, isLoading, messagesEndRef }) => {
	const scrollContainerRef = useRef(null);
	const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
	const [hasNewContent, setHasNewContent] = useState(false);
	const lastProcessedMessageCount = useRef(0);
	const lastScrollPositionRef = useRef(0);

	// Scroll settings based on content
	const LINE_HEIGHT = 24; // Base line height in pixels
	const SCROLL_THRESHOLD = 150; // Distance from bottom to consider "scrolled up"

	// Check if user has scrolled up
	const isScrolledUp = useCallback(() => {
		if (!scrollContainerRef.current) return false;
		const { scrollTop, scrollHeight, clientHeight } =
			scrollContainerRef.current;
		return scrollHeight - (scrollTop + clientHeight) > SCROLL_THRESHOLD;
	}, []);

	// Content-based smooth scroll implementation
	const performContentScroll = useCallback(() => {
		if (!scrollContainerRef.current || !isAutoScrollEnabled || isScrolledUp())
			return;

		const container = scrollContainerRef.current;
		const messageElements = container.getElementsByClassName('message-line');
		if (messageElements.length === 0) return;

		const lastMessage = messageElements[messageElements.length - 1];
		const lastMessageRect = lastMessage.getBoundingClientRect();
		const containerRect = container.getBoundingClientRect();

		// Calculate how much of the last message is visible
		const messageVisibleHeight = Math.min(
			lastMessageRect.bottom - containerRect.top,
			lastMessageRect.height
		);

		// If message is not fully visible, scroll one line
		if (messageVisibleHeight < lastMessageRect.height) {
			const currentScroll = container.scrollTop;
			// Use direct assignment instead of scrollTo
			container.scrollTop = currentScroll + LINE_HEIGHT;
			lastScrollPositionRef.current = currentScroll + LINE_HEIGHT;
		}
	}, [isAutoScrollEnabled, isScrolledUp]);

	// Handle content-based scrolling
	useEffect(() => {
		if (
			messages.length > lastProcessedMessageCount.current &&
			isAutoScrollEnabled
		) {
			performContentScroll();
		}
	}, [messages, performContentScroll, isAutoScrollEnabled]);

	// Handle scroll events
	const handleScroll = useCallback(
		throttle(() => {
			const isUp = isScrolledUp();

			if (isUp && isAutoScrollEnabled) {
				setIsAutoScrollEnabled(false);
			}

			setHasNewContent(
				isUp && messages.length > lastProcessedMessageCount.current
			);

			// Update last scroll position
			if (scrollContainerRef.current) {
				lastScrollPositionRef.current = scrollContainerRef.current.scrollTop;
			}
		}, 5000),
		[messages.length, isAutoScrollEnabled, isScrolledUp]
	);

	// Add scroll listener
	useEffect(() => {
		const container = scrollContainerRef.current;
		if (container) {
			container.addEventListener('scroll', handleScroll, { passive: true });
			return () => container.removeEventListener('scroll', handleScroll);
		}
	}, [handleScroll]);

	// Track new messages
	useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container) return;

		if (messages.length > lastProcessedMessageCount.current) {
			if (isScrolledUp()) {
				setHasNewContent(true);
			} else if (isAutoScrollEnabled) {
				performContentScroll();
			}
		}

		// Update processed message count when message stream completes
		if (!isLoading) {
			lastProcessedMessageCount.current = messages.length;
			setHasNewContent(false);
		}
	}, [
		messages.length,
		isLoading,
		isAutoScrollEnabled,
		isScrolledUp,
		performContentScroll,
	]);

	const toggleAutoScroll = useCallback(() => {
		setIsAutoScrollEnabled((prev) => {
			if (!prev) {
				// When enabling auto-scroll, immediately scroll to bottom
				const container = scrollContainerRef.current;
				if (container) {
					container.scrollTop = container.scrollHeight - container.clientHeight;
					lastProcessedMessageCount.current = messages.length;
					setHasNewContent(false);
				}
			}
			return !prev;
		});
	}, [messages.length]);

	return (
		<div className='relative flex flex-col w-full h-full'>
			<div
				ref={scrollContainerRef}
				className='flex flex-col overflow-y-auto space-y-4 backdrop-blur-lg z-0 pt-20 pb-24'>
				<div className='w-full max-w-3xl mx-auto flex flex-col gap-4'>
					{messages.map((message) => (
						<div
							key={message.id}
							className='message-line animate-fade-in opacity-0' // Add these classes
						>
							<Message
								role={message.role}
								content={message.content}
								timestamp={message.timestamp}
							/>
						</div>
					))}
					<div ref={messagesEndRef} />
				</div>
			</div>

			{/* Auto-scroll toggle button with smoother animations */}
			{(hasNewContent || !isAutoScrollEnabled) && (
				<button
					onClick={toggleAutoScroll}
					className={`fixed bottom-80 right-6 p-3 rounded-full shadow-lg transition-all duration-500 
            ${
							isAutoScrollEnabled
								? 'bg-base-content/10 hover:bg-base-content/20'
								: 'bg-base-300 hover:bg-base-200'
						} 
            ${hasNewContent ? 'opacity-100' : 'opacity-70'}
            transform transition-transform duration-500 ease-in-out
            hover:scale-110`}
					aria-label={
						isAutoScrollEnabled ? 'Disable auto-scroll' : 'Enable auto-scroll'
					}>
					<div className='flex items-center space-x-1'>
						{isAutoScrollEnabled ? (
							<ArrowUp className='w-5 h-5 text-base-content' />
						) : (
							<>
								<ArrowDown className='w-5 h-5 text-base-content' />
								{hasNewContent && (
									<MessageSquare className='w-4 h-4 text-warning transition-opacity duration-1000 ease-in-out' />
								)}
							</>
						)}
					</div>
				</button>
			)}
		</div>
	);
};

export default memo(MessageList);
