import React from 'react';
import Message from './Message';
import LoadingMessage from './LoadingMessage';

const MessageList = ({ messages, isLoading, messagesEndRef }) => {
	return (
		<div className='flex-1 overflow-y-auto p-6 space-y-6  backdrop-blur-lg'>
			<div className='max-w-4xl mx-auto flex flex-col gap-2'>
				{messages.length > 0 ? (
					messages.map(({ id, role, content }) => (
						<Message
							key={id}
							role={role}
							content={content}
						/>
					))
				) : (
					<Message
						role='assistant'
						content='Welcome, how can I assist you today?'
					/>
				)}
				{isLoading && <LoadingMessage />}
				<div ref={messagesEndRef} />
			</div>
		</div>
	);
};

export default MessageList;
