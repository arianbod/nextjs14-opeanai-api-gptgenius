'use client';
import React, { useState, useEffect, useRef, memo } from 'react';
import Slider from 'rc-slider';
import { discountSpots } from '@/lib/discountSpots';
import { FaGift, FaStar, FaRocket, FaCrown, FaGem } from 'react-icons/fa';
import { useTranslations } from '@/context/TranslationContext';

const TokenSlider = ({ isOpen, onClose }) => {
	const dict = useTranslations();
	const [value, setValue] = useState(discountSpots[0].price);
	const [currentDiscount, setCurrentDiscount] = useState(
		discountSpots[0].discountPercentage
	);
	const [currentTokens, setCurrentTokens] = useState(discountSpots[0].tokens);
	const [activeSpot, setActiveSpot] = useState(discountSpots[0].key);
	const modalRef = useRef(null);

	useEffect(() => {
		const applicableSpot = discountSpots
			.filter((spot) => value >= spot.price)
			.slice(-1)[0];
		setCurrentDiscount(applicableSpot.discountPercentage);
		setCurrentTokens(applicableSpot.tokens);
		setActiveSpot(applicableSpot.key);
	}, [value]);

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		};
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, onClose]);

	const min = discountSpots[0].price;
	const max = discountSpots[discountSpots.length - 1].price;

	const marks = discountSpots.reduce((acc, spot) => {
		const isActive = value >= spot.price;
		acc[spot.price] = {
			label: spot.discountPercentage > 0 && (
				<div
					className={`flex flex-col items-center select-none ${
						isActive ? 'text-blue-600' : 'text-gray-500'
					}`}>
					<span className='text-2xl mb-2'>{spot.icon}</span>
					<span className='text-xs'>{spot.discountPercentage}%</span>
					<span className='text-xs'>{spot.tokens}</span>
				</div>
			),
			style: { color: isActive ? '#3b82f6' : '#9ca3af' },
		};
		return acc;
	}, {});

	const discountedAmount = (value * (1 - currentDiscount / 100)).toFixed(2);
	const savings = (value - discountedAmount).toFixed(2);

	if (!isOpen) return null;

	return (
		<div className='inset-0 z-50 flex items-center justify-center select-none transition-opacity duration-300 ease-in-out'>
			<div
				ref={modalRef}
				className={`flex flex-col gap-8 rounded-lg p-6 w-full max-w-md relative overflow-hidden transform transition-transform duration-300 ease-in-out ${
					isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
				}`}>
				<h2 className='text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-gray-100'>
					{dict.global.purchaseTokens}
				</h2>

				<div className='mb-8 px-4'>
					<Slider
						min={min}
						max={max}
						marks={marks}
						step={1}
						value={value}
						onChange={setValue}
						dotStyle={{}}
						activeDotStyle={{}}
					/>
				</div>

				<div className='space-y-6 mt-8'>
					<div className='bg-gray-100 dark:bg-gray-700 rounded-xl shadow-inner p-4 flex justify-between items-center'>
						<div>
							<p className='text-sm text-gray-500 dark:text-gray-300'>
								{dict.global.selectedAmount}
							</p>
							<div className='relative mt-1'>
								<span className='absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500'>
									$
								</span>
								<input
									type='number'
									value={value}
									onChange={(e) =>
										setValue(Math.min(Math.max(e.target.value, min), max))
									}
									className='block w-full pl-7 pr-12 py-2 text-lg font-semibold text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
								/>
							</div>
						</div>
						<div className='text-right'>
							<p className='text-sm text-gray-500 dark:text-gray-300'>
								{dict.global.discount}
							</p>
							<p className='text-lg font-semibold text-gray-800 dark:text-gray-100'>
								{currentDiscount}% OFF
							</p>
						</div>
					</div>

					<div className='bg-gradient-to-r from-blue-100 to-blue-200 dark:from-gray-600 dark:to-gray-700 rounded-xl shadow-inner p-4 flex justify-between items-center'>
						<div>
							<p className='text-sm text-gray-500 dark:text-gray-300'>
								{dict.global.discount}
							</p>
							<p className='text-xl font-bold text-green-600 dark:text-green-400'>
								${savings}
							</p>
						</div>
						<div className='text-right'>
							<p className='text-sm text-gray-500 dark:text-gray-300'>
								{dict.global.finalPrice}
							</p>
							<p className='text-xl font-bold text-blue-600 dark:text-blue-400'>
								${discountedAmount}
							</p>
						</div>
					</div>

					<div className='bg-gradient-to-r from-purple-100 to-purple-200 dark:from-gray-700 dark:to-gray-800 rounded-xl shadow-inner p-4 flex justify-between items-center'>
						<div>
							<p className='text-sm text-gray-500 dark:text-gray-300'>
								{dict.global.tokens}
							</p>
							<p className='text-xl font-bold text-purple-600 dark:text-purple-400'>
								{currentTokens} tokens
							</p>
						</div>
					</div>

					<button
						className='w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:from-blue-700 hover:to-purple-700 transition-colors duration-300 focus:outline-none'
						onClick={() => {
							alert(
								`You have selected to purchase ${currentTokens} tokens for $${discountedAmount} (${currentDiscount}% discount)!`
							);
							onClose();
						}}>
						{dict.global.purchase}
					</button>
				</div>
			</div>
		</div>
	);
};

export default memo(TokenSlider);
