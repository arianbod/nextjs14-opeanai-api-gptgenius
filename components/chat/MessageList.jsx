import React, { useState } from 'react';
import Message from './Message';
import LoadingMessage from './LoadingMessage';
import { Search, Filter } from 'lucide-react';

const MessageList = ({ messages, isLoading, messagesEndRef }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [filter, setFilter] = useState('all');

	const filteredMessages = messages.filter((message) => {
		const matchesSearch = message.content
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		const matchesFilter = filter === 'all' || message.role === filter;
		return matchesSearch && matchesFilter;
	});

	return (
		<div className='flex flex-col'>
			<div className='flex items-center space-x-2 p-4 bg-gray-100'>
				<input
					type='text'
					placeholder='Search messages...'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className='flex-grow p-2 border rounded'
				/>
				<button
					className={`px-3 py-1 rounded ${
						filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'
					}`}
					onClick={() => setFilter('all')}>
					All
				</button>
				<button
					className={`px-3 py-1 rounded ${
						filter === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'
					}`}
					onClick={() => setFilter('user')}>
					User
				</button>
				<button
					className={`px-3 py-1 rounded ${
						filter === 'assistant' ? 'bg-blue-500 text-white' : 'bg-gray-200'
					}`}
					onClick={() => setFilter('assistant')}>
					Assistant
				</button>
			</div>
			<div className='flex-1 overflow-y-auto p-6 space-y-6 backdrop-blur-lg'>
				<div className='max-w-4xl mx-auto flex flex-col gap-2'>
					{filteredMessages.length > 0 ? (
						filteredMessages.map(({ id, role, content, timestamp }) => (
							<Message
								key={id}
								role={role}
								content={content}
								timestamp={timestamp}
							/>
						))
					) : (
						<Message
							role='assistant'
							content='Welcome! How can I assist you today?'
							timestamp={new Date().toISOString()}
						/>
					)}
					{isLoading && <LoadingMessage />}
					<div ref={messagesEndRef} />
				</div>
			</div>
		</div>
	);
};

export default MessageList;
