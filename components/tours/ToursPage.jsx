'use client';

import { getAllTours } from '@/server/action';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import ToursList from './ToursList';
const capitalizeFirstLetter = (string) => {
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};
const ToursPage = () => {
	const [searchValue, setSearchValue] = useState('');
	const { data, isPending } = useQuery({
		queryKey: ['tours', searchValue],
		queryFn: async () => {
			return await getAllTours(searchValue);
		},
	});
	const handleSubmit = (e) => {
		e.preventDefault();
		getAllTours(searchValue);
	};
	return (
		<>
			<form
				className='max-w-lg mb-12'
				onSubmit={handleSubmit}>
				<div className='join w-ful'>
					<input
						type='text'
						placeholder='enter city or country'
						className='input input-bordered join-item w-full'
						value={searchValue}
						onChange={(e) =>
							setSearchValue(capitalizeFirstLetter(e.target.value))
						}
						required
					/>
					<button
						className='join-item btn btn-primary'
						type='submit'
						onClick={() => setSearchValue('')}
						disabled={isPending}>
						{isPending ? 'wait...' : 'clear'}
					</button>
				</div>
			</form>

			{isPending ? (
				<span className='loading'></span>
			) : (
				<ToursList data={data} />
			)}
		</>
	);
};

export default ToursPage;
