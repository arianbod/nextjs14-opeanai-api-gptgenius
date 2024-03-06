'use client';
import React from 'react';
import TourCard from './TourCard';
const ToursList = ({ data }) => {
	if (data.length === 0) return <h4 className='text-lg'> no tours found...</h4>;

	return (
		<div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-8'>
			{data.map((tour, index) => {
				index = index + 1;
				return (
					<TourCard
						index={index}
						{...tour}
						key={tour.id}
					/>
				);
			})}
		</div>
	);
};

export default ToursList;
