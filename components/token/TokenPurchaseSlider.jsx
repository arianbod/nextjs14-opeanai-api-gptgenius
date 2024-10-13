// components/token/TokenSlider.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { discountSpots } from '@/lib/discountSpots';
import { FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const TokenSlider = ({ isOpen, onClose }) => {
	const [value, setValue] = useState(discountSpots[0].price);
	const [currentDiscount, setCurrentDiscount] = useState(
		discountSpots[0].discountPercentage
	);

	useEffect(() => {
		// Determine the current discount based on the slider value
		const applicableSpot = discountSpots
			.filter((spot) => value >= spot.price)
			.slice(-1)[0];
		setCurrentDiscount(applicableSpot.discountPercentage);
	}, [value]);

	// Get minimum and maximum values from discountSpots
	const min = discountSpots[0].price;
	const max = discountSpots[discountSpots.length - 1].price;

	// Marks for the slider
	const marks = discountSpots.reduce((acc, spot) => {
		acc[spot.price] = {
			label: (
				<div className='flex flex-col items-center select-none'>
					<span>{spot.price}$</span>
					<span className='text-xs'>{spot.discountPercentage}% OFF</span>
				</div>
			),
			style: { color: '#3b82f6' },
		};
		return acc;
	}, {});

	// Calculate discounted amount
	const discountedAmount = (value * (1 - currentDiscount / 100)).toFixed(2);
	const savings = (value - discountedAmount).toFixed(2);

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70'
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					style={{ userSelect: 'none' }}>
					<motion.div
						className='bg-white dark:bg-base-200 rounded-lg p-8 w-full h-full max-w-2xl relative overflow-auto'
						initial={{ scale: 0.8 }}
						animate={{ scale: 1 }}
						exit={{ scale: 0.8 }}>
						<button
							onClick={onClose}
							className='absolute top-6 right-6 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'>
							<FaTimes size={24} />
						</button>
						<h2 className='text-3xl font-semibold mb-6 text-center select-none'>
							Select Your Purchase Amount
						</h2>
						<div className='mb-8'>
							<Slider
								min={min}
								max={max}
								marks={marks}
								step={10}
								value={value}
								onChange={setValue}
								railStyle={{
									background:
										'linear-gradient(to right, #3b82f6 0%, #3b82f6 100%)',
									height: 10,
								}}
								handleStyle={{
									borderColor: '#3b82f6',
									height: 30,
									width: 30,
									marginLeft: -15,
									marginTop: -10,
									backgroundColor: '#fff',
									boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)',
								}}
								trackStyle={{
									background: 'linear-gradient(to right, #3b82f6, #9333ea)',
									height: 10,
								}}
							/>
						</div>
						<motion.div
							className='flex flex-col items-center space-y-4'
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}>
							<div className='flex space-x-4'>
								<div className='text-lg'>
									<span className='font-medium'>Original Amount:</span> {value}$
								</div>
								<div className='text-lg'>
									<span className='font-medium'>Discount:</span>{' '}
									{currentDiscount}% OFF
								</div>
							</div>
							<div className='text-2xl text-green-600'>
								<span className='font-bold'>You Save:</span> {savings}$
							</div>
							<div className='text-2xl text-blue-600'>
								<span className='font-bold'>Pay Only:</span> {discountedAmount}$
							</div>
							<button
								className='mt-6 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition text-lg'
								onClick={() => {
									// Implement your charge logic here
									alert(
										`You have selected to charge ${value}$ with a ${currentDiscount}% discount!`
									);
									onClose();
								}}>
								Apply Discount
							</button>
						</motion.div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default TokenSlider;
