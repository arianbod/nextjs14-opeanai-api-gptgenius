'use client';
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	getExistingTour,
	generateTourResponse,
	createNewTour,
} from '@/utils/action';
import toast from 'react-hot-toast';
import TourInfo from './TourInfo';
const NewTour = () => {
	const {
		mutate,
		isPending,
		data: tour,
	} = useMutation({
		mutationFn: async (destionation) => {
			const newTour = await generateTourResponse(destionation);
			if (newTour) {
				return newTour;
			}
			toast.error('no matching city found...');
			return null;
		},
	});
	const handleSubmit = (e) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const destination = Object.fromEntries(formData.entries());
		mutate(destination);
	};
	if (isPending) {
		return <span className='loading loading-lg'></span>;
	}
	return (
		<div>
			<form
				className='max-w-2xl'
				onSubmit={handleSubmit}>
				<h2 className='mb-4'>select your dream destination</h2>
				<div className='join w-full'>
					<input
						type='text'
						id='country'
						name='country'
						className='w-full join-item input input-bordered'
						placeholder='add a country name'
					/>
					<input
						type='text'
						id='city'
						name='city'
						className='w-full join-item input input-bordered'
						placeholder='add a city name'
					/>
					<button
						className='btn btn-primary join-item'
						type='submit'
						disabled={isPending}>
						{isPending ? 'wait...' : 'generate tour'}
					</button>
				</div>
			</form>
			<div className='mt-16'>{tour && <TourInfo tour={tour} />}</div>
		</div>
	);
};

export default NewTour;
