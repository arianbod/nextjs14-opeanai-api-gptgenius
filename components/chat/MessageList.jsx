// MessageList.js
import React from 'react';
import Message from './Message';
import LoadingMessage from './LoadingMessage';

const MessageList = ({ messages, isLoading, messagesEndRef }) => (
	<div className='flex-1 overflow-y-auto p-4 space-y-4 bg-base-200'>
		{messages.map(({ id, role, content }) => (
			<Message
				key={id}
				role={role}
				content={content}
			/>
		))}
		{isLoading && <LoadingMessage />}
		<div ref={messagesEndRef} />
	</div>
);

export default MessageList;
