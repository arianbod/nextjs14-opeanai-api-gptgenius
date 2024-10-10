import React from 'react';
import Message from './Message';
import LoadingMessage from './LoadingMessage';
import { useChat } from '@/context/ChatContext';
import { Search, X } from 'lucide-react';

const MessageList = ({ isLoading, messagesEndRef }) => {
	const {
		filteredMessages,
		isSearchOpen,
		searchTerm,
		setSearchTerm,
		searchFilter,
		setSearchFilter,
		toggleSearch,
	} = useChat();

	return (
		<div className='relative flex flex-col h-full'>
			{isSearchOpen && (
				<div className='absolute inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20'>
					<div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-4 m-4'>
						<div className='flex justify-between items-center mb-4'>
							<h2 className='text-lg font-semibold text-gray-800 dark:text-white'>
								Search Messages
							</h2>
							<button
								onClick={toggleSearch}
								className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'>
								<X size={24} />
							</button>
						</div>
						<div className='relative mb-4'>
							<input
								type='text'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder='Search messages...'
								className='w-full p-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
							/>
							<Search
								className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
								size={18}
							/>
						</div>
						<div className='flex justify-center space-x-2'>
							{['all', 'user', 'assistant'].map((filter) => (
								<button
									key={filter}
									onClick={() => setSearchFilter(filter)}
									className={`px-3 py-1 rounded-md transition-colors duration-200 ${
										searchFilter === filter
											? 'bg-blue-500 text-white'
											: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
									}`}>
									{filter.charAt(0).toUpperCase() + filter.slice(1)}
								</button>
							))}
						</div>
					</div>
				</div>
			)}

			<div className='flex-1 overflow-y-auto p-4 space-y-4 backdrop-blur-lg z-10'>
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
					{isLoading && <LoadingMessage />}
					<div ref={messagesEndRef} />
				</div>
			</div>
		</div>
	);
};

export default MessageList;
