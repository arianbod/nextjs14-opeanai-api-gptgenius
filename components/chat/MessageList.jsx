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
		<div className='flex flex-col h-full'>
			<div className='flex flex-col space-y-2 p-4'>
				<div className='relative'>
					<input
						type='text'
						placeholder='Search messages...'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className='w-full p-2 pr-8 border rounded'
					/>
					<Search
						className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400'
						size={18}
					/>
				</div>
				<div className='flex justify-center space-x-2'>
					<button
						className={`px-3 py-1 rounded transition-colors duration-300 ease-in-out ${
							filter === 'all' ? 'bg-blue-500 text-white' : 'hover:bg-blue-100'
						}`}
						onClick={() => setFilter('all')}>
						All
					</button>
					<button
						className={`px-3 py-1 rounded transition-colors duration-300 ease-in-out ${
							filter === 'user'
								? 'bg-blue-500 text-white'
								: ' hover:bg-blue-500/50'
						}`}
						onClick={() => setFilter('user')}>
						User
					</button>
					<button
						className={`px-3 py-1 rounded transition-colors duration-300 ease-in-out ${
							filter === 'assistant'
								? 'bg-blue-500 text-white'
								: ' hover:bg-blue-500/50'
						}`}
						onClick={() => setFilter('assistant')}>
						Assistant
					</button>
				</div>
			</div>
			<div className='flex-1 overflow-y-auto p-4 space-y-4 backdrop-blur-lg'>
				<div className='max-w-4xl mx-auto flex flex-col gap-2'>
					{filteredMessages.length > 0 ? (
						filteredMessages.map(({ id, role, content, timestamp }) => (
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
								content='Welcome! How can I assist you today?'
								timestamp={new Date().toISOString()}
							/>
						</div>
					)}
					{isLoading && <LoadingMessage />}
					<div ref={messagesEndRef} />
				</div>
			</div>
		</div>
	);
};

export default MessageList;
