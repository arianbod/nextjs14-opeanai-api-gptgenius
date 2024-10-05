import React from 'react';
import Message from './Message';
import LoadingMessage from './LoadingMessage';
import { useAuth } from '@/context/AuthContext';

const MessageList = ({ messages, isLoading, messagesEndRef }) => {
	return (
		<div className='flex-1 overflow-y-auto p-4 space-y-4 bg-base-200'>
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
					content={`Welcome, How can I assist you today?`}
				/>
			)}
			{isLoading && <LoadingMessage />}
			<div ref={messagesEndRef} />
		</div>
	);
};
export default MessageList;
