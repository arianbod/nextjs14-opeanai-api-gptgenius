// pages/search.js

import React from 'react';
import SearchInterface from '@/components/chat/SearchInterface';

const SearchPage = () => {
	return (
		<div className='min-h-screen bg-gray-100 dark:bg-gray-900 p-4'>
			<div className='max-w-7xl mx-auto'>
				<h1 className='text-4xl font-bold mb-8 text-center text-gray-800 dark:text-gray-200'>
					Perplexity AI Search
				</h1>
				<SearchInterface />
			</div>
		</div>
	);
};

export default SearchPage;
