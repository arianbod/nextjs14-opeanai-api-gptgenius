import React, { memo, useEffect, useRef, useCallback } from 'react';
import { throttle } from 'lodash';
import Message from './Message';
import LoadingMessage from './LoadingMessage';
import { useChat } from '@/context/ChatContext';

const MessageList = ({ isLoading, messagesEndRef, msgLen }) => {
	const { filteredMessages } = useChat();
	const scrollContainerRef = useRef(null);
	const isAutoScrollEnabled = useRef(true);

	// Throttled scroll handler to detect when user manually scrolls up
	const handleScroll = useCallback(
		throttle(() => {
			if (!scrollContainerRef.current) return;

			const { scrollTop, scrollHeight, clientHeight } =
				scrollContainerRef.current;
			const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 100;

			isAutoScrollEnabled.current = isNearBottom;
		}, 100),
		[]
	);

	// Smooth scroll to bottom function
	const scrollToBottom = useCallback(() => {
		if (!scrollContainerRef.current || !isAutoScrollEnabled.current) return;

		scrollContainerRef.current.scrollTo({
			top: scrollContainerRef.current.scrollHeight,
			behavior: 'smooth',
		});
	}, []);

	// Effect to handle automatic scrolling when new messages arrive
	useEffect(() => {
		scrollToBottom();
	}, [filteredMessages, scrollToBottom]);

	// Effect to handle initial scroll and cleanup
	useEffect(() => {
		const scrollContainer = scrollContainerRef.current;
		if (scrollContainer) {
			scrollContainer.addEventListener('scroll', handleScroll);
			scrollToBottom();
		}

		return () => {
			if (scrollContainer) {
				scrollContainer.removeEventListener('scroll', handleScroll);
			}
			handleScroll.cancel();
		};
	}, [handleScroll]);

	return (
		<div className='relative flex flex-col h-full'>
			<div
				ref={scrollContainerRef}
				className='flex-1 overflow-y-auto space-y-4 backdrop-blur-lg z-0 pt-14 pb-24 scroll-smooth'>
				<div className='max-w-4xl mx-auto flex flex-col gap-4'>
					{filteredMessages().length > 0 ? (
						filteredMessages().map(({ id, role, content, timestamp }) => (
							<div
								key={id}
								className='transition-opacity duration-300 ease-in-out opacity-100'>
								<Message
									role={role}
									content={content}
									timestamp={timestamp}
								/>
							</div>
						))
					) : (
						<div className='transition-opacity duration-300 ease-in-out opacity-100'>
							<Message
								role='assistant'
								content='No messages found. Try adjusting your search.'
								timestamp={new Date().toISOString()}
							/>
						</div>
					)}
					{/* {isLoading && <LoadingMessage />} */}
					<div ref={messagesEndRef} />
				</div>
			</div>
		</div>
	);
};

export default memo(MessageList);
