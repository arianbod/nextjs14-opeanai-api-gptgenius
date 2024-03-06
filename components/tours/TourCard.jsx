'use client';
import React from 'react';
import Link from 'next/link';
const TourCard = ({ city, title, id, country, index }) => {
	return (
		<Link
			href={`/tours/${id}`}
			className='card card-compact rounded-xl bg-base-100'>
			<div className='card-body items-center text-center relative'>
				<span className='top-0 left-0 absolute pl-2 py-2 text-gray-400'>
					{index}
				</span>
				<h2 className='card-title text-center'>
					{city}, {country}
				</h2>
			</div>
		</Link>
	);
};

export default TourCard;
