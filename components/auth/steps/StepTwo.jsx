'use client';

import React, { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';

const StepTwo = ({
	selectedAnimals,
	onAnimalSelect,
	onAnimalRemove,
	onNext,
	error,
	dict,
}) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [showLists, setShowLists] = useState(true);

	useEffect(() => {
		setShowLists(selectedAnimals.length < 3);
	}, [selectedAnimals.length]);

	const SelectedAnimalsDisplay = () => (
		<div className='flex flex-wrap justify-center gap-3 mb-6'>
			{selectedAnimals.map((animal, index) => (
				<motion.div
					key={`slot-${index}`}
					className={`w-20 h-20 md:w-24 md:h-24 rounded-xl flex items-center justify-center 
            ${
							animal
								? 'bg-white dark:bg-gray-700 shadow-lg'
								: 'border-2 border-dashed border-gray-300 dark:border-gray-600'
						}`}
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.5 }}
					transition={{ delay: index * 0.1 }}>
					{animal && (
						<div className='relative w-full h-full flex items-center justify-center group'>
							<motion.span
								className='text-3xl md:text-4xl'
								whileHover={{ scale: 1.1 }}
								transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
								{animal.emoji}
							</motion.span>
							<button
								onClick={() => onAnimalRemove(index)}
								className='absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transform transition-transform group-hover:scale-110'
								aria-label={`Remove ${animal.label}`}>
								×
							</button>
						</div>
					)}
				</motion.div>
			))}
		</div>
	);

	// Filter animals by search
	const filteredAnimals = dict.auth.animalList.filter(
		(animal) =>
			animal.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
			animal.key.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Mapping from animal key to emoji for display
	const emojiMapping = {
		dog: '🐶',
		cat: '🐱',
		elephant: '🐘',
		lion: '🦁',
		tiger: '🐯',
		bear: '🐻',
		monkey: '🐵',
		giraffe: '🦒',
		zebra: '🦓',
		penguin: '🐧',
		kangaroo: '🦘',
		koala: '🐨',
	};

	return (
		<div className='md:space-y-6'>
			<motion.div
				className='text-center'
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}>
				<h2 className='text-md md:text-2xl font-bold text-gray-800 dark:text-white md:mb-2'>
					{dict.auth.selectAnimalsInOrder}
				</h2>
				<p className='text-sm md:text-base text-gray-500 dark:text-gray-300'>
					{dict.auth.orderMatters}
				</p>
			</motion.div>

			<SelectedAnimalsDisplay />

			<AnimatePresence>
				{showLists && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						className='lg:space-y-6'>
						{/* Search Bar */}
						{/* <div className='relative mx-auto max-w-md mb-4'>
							<Search
								className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
								size={20}
							/>
							<input
								type='text'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder='Search animals...'
								className='w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							/>
						</div> */}

						{/* Animals in a single grid (no groups) */}
						<div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3'>
							{filteredAnimals.map((animal) => {
								const isSelected = selectedAnimals.find(
									(a) => a.key === animal.key
								);
								const isDisabled = selectedAnimals.length >= 3 && !isSelected;

								return (
									<motion.button
										key={animal.key}
										onClick={() => onAnimalSelect(animal.key)}
										disabled={isDisabled}
										className={`aspect-square rounded-xl p-2 md:p-4 relative select-none
                      ${
												isSelected
													? 'ring-2 ring-blue-500 bg-white dark:bg-gray-700'
													: isDisabled
													? 'bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed'
													: 'bg-white dark:bg-gray-700 hover:ring-2 hover:ring-blue-500'
											}
                      transform transition-all duration-200 shadow-sm hover:shadow-md`}
										whileHover={!isDisabled ? { scale: 1.05 } : {}}
										whileTap={!isDisabled ? { scale: 0.95 } : {}}
										aria-label={`Select ${animal.label}`}>
										<div className='w-full h-full flex items-center justify-center'>
											<span className='text-2xl md:text-4xl'>
												{emojiMapping[animal.key] || '🐾'}
											</span>
										</div>
									</motion.button>
								);
							})}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{error && (
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className='text-red-500 text-center text-sm'>
					{error}
				</motion.p>
			)}

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: selectedAnimals.length === 3 ? 1 : 0.5 }}
				className='flex justify-center'>
				<button
					onClick={onNext}
					disabled={selectedAnimals.length !== 3}
					className={`px-6 md:px-8 py-2.5 md:py-3 rounded-full font-semibold text-white
            ${
							selectedAnimals.length === 3
								? 'bg-blue-500 hover:bg-blue-600'
								: 'bg-gray-300 cursor-not-allowed'
						}
            transition-colors duration-200`}>
					{dict.auth.continue}
				</button>
			</motion.div>
		</div>
	);
};

export default memo(StepTwo);
