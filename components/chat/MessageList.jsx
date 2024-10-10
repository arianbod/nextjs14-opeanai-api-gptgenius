// MessageList.js
import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';
import LoadingMessage from './LoadingMessage';
import { Search, X } from 'lucide-react';

const MessageList = ({ messages, isLoading, messagesEndRef }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [filter, setFilter] = useState('all');
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const searchContainerRef = useRef(null);

	// Close search when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				searchContainerRef.current &&
				!searchContainerRef.current.contains(event.target)
			) {
				setIsSearchOpen(false);
			}
		};
		if (isSearchOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		} else {
			document.removeEventListener('mousedown', handleClickOutside);
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isSearchOpen]);

	const filteredMessages = messages.filter((message) => {
		const matchesSearch = message.content
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		const matchesFilter = filter === 'all' || message.role === filter;
		return matchesSearch && matchesFilter;
	});

	return (
		<div className='flex flex-col pb-20'>
			<div
				className='p-4 flex justify-end z-20'
				ref={searchContainerRef}>
				<div className='relative'>
					{/* Search Icon */}
					<button
						onClick={() => setIsSearchOpen((prev) => !prev)}
						className='p-2 rounded-full hover:bg-gray-200 transition'
						title='Search'
						aria-label='Toggle Search'>
						{isSearchOpen ? <X size={18} /> : <Search size={18} />}
					</button>

					{/* Search Input and Filters */}
					<div
						className={`absolute right-0 top-12 rounded  bg-white/50 dark:bg-black/75 backdrop-blur-lg shadow-lg p-4 w-80 transition-all duration-300 ease-in-out ${
							isSearchOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
						}`}>
						<div className='relative mb-4'>
							<input
								type='text'
								placeholder='Search messages...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='w-full p-2 pr-8 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
							/>
							<Search
								className='absolute right-2 top-1/2 transform -translate-y-1/2 '
								size={18}
							/>
						</div>
						<div className='flex justify-center space-x-2 mb-4'>
							<button
								className={`px-3 py-1 rounded transition-colors duration-300 ease-in-out ${
									filter === 'all'
										? 'bg-blue-500 text-white'
										: 'hover:bg-blue-100'
								}`}
								onClick={() => setFilter('all')}>
								All
							</button>
							<button
								className={`px-3 py-1 rounded transition-colors duration-300 ease-in-out ${
									filter === 'user'
										? 'bg-blue-500 text-white'
										: 'hover:bg-blue-100'
								}`}
								onClick={() => setFilter('user')}>
								User
							</button>
							<button
								className={`px-3 py-1 rounded transition-colors duration-300 ease-in-out ${
									filter === 'assistant'
										? 'bg-blue-500 text-white'
										: 'hover:bg-blue-100'
								}`}
								onClick={() => setFilter('assistant')}>
								Assistant
							</button>
						</div>
						{/* Optional: Add more search options here */}
					</div>
				</div>
			</div>

			<div className='flex-1 overflow-y-auto p-4 space-y-4 backdrop-blur-lg z-10'>
				<div className='max-w-4xl mx-auto flex flex-col gap-4'>
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
