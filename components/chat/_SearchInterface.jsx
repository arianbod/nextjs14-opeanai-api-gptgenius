// components/SearchInterface.js

'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchPerplexity } from '@/server/perplexity';
import Image from "next/legacy/image";
import { useDebounce } from 'use-debounce';
import Link from 'next/link';

// Inside SearchInterface component

const SearchInterface = () => {
	const [query, setQuery] = useState('');
	const [image, setImage] = useState(null);
	const [results, setResults] = useState([]);

	const [debouncedQuery] = useDebounce(query, 500);
	const searchMutation = useMutation({
		mutationFn: ({ query, image }) => fetchPerplexity(query, image),
		onSuccess: (data) => {
			if (data.results) {
				setResults(data.results);
			} else if (data.error) {
				toast.error(data.error);
			}
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!query.trim() && !image) {
			toast.error('Please enter a query or upload an image.');
			return;
		}
		searchMutation.mutate({ query, image });
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file && file.type.startsWith('image/')) {
			setImage(file);
		} else {
			toast.error('Please select a valid image file.');
		}
	};

	return (
		<div className='max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md'>
			<h2 className='text-2xl font-bold mb-4 text-center'>Search Engine</h2>
			<form
				onSubmit={handleSubmit}
				className='space-y-4'>
				<div>
					<label
						htmlFor='query'
						className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
						Text Query
					</label>
					<input
						type='text'
						id='query'
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder='Enter your search query...'
						className='mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white'
					/>
				</div>
				<div>
					<label
						htmlFor='image'
						className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
						Upload Image (Optional)
					</label>
					<input
						type='file'
						id='image'
						accept='image/*'
						onChange={handleImageChange}
						className='mt-1 block w-full text-sm text-gray-500 dark:text-gray-300
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-white'
					/>
				</div>
				<button
					type='submit'
					className='w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
					disabled={searchMutation.isLoading}>
					{searchMutation.isLoading ? 'Searching...' : 'Search'}
				</button>
			</form>

			{searchMutation.isLoading && (
				<div className='mt-6 text-center'>
					<div className='loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mx-auto'></div>
					<p className='mt-2 text-gray-600 dark:text-gray-400'>
						Fetching results...
					</p>
				</div>
			)}

			{results.length > 0 && (
				<div className='mt-6'>
					<h3 className='text-xl font-semibold mb-4'>Search Results:</h3>
					<ul className='space-y-4'>
						{results.map((result) => (
							<Link
								key={result.id}
								className='p-4 border border-gray-200 dark:border-gray-700 rounded-md'
								href={result.url}
								rel='noopener noreferrer'
								target='_blank'>
								{result.imageUrl && (
									<Image
										src={result.imageUrl}
										alt={result.title}
										width={400}
										height={200}
										className='w-full h-auto object-cover rounded-md mb-2'
									/>
								)}
								<h4 className='text-lg font-medium text-blue-600 dark:text-blue-400'>
									{result.title}
								</h4>
								<p className='text-gray-700 dark:text-gray-300'>
									{result.snippet}
								</p>
							</Link>
						))}
					</ul>
				</div>
			)}

			{results.length === 0 && !searchMutation.isLoading && (
				<p className='mt-6 text-center text-gray-500 dark:text-gray-400'>
					No results found.
				</p>
			)}
		</div>
	);
};

export default SearchInterface;
