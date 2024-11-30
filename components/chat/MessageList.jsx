import React, { memo } from 'react';
import Message from './Message';
import LoadingMessage from './LoadingMessage';
import { useChat } from '@/context/ChatContext';

const MessageList = ({ isLoading, messagesEndRef, msgLen }) => {
	const { filteredMessages } = useChat();

	return (
		<div className='relative flex flex-col'>
			<div className='flex-1 overflow-y-auto space-y-4 backdrop-blur-lg z-0 pt-14 pb-14'>
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
