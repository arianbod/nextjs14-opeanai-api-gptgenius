'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';

const StepTwo = ({
	selectedAnimals,
	onAnimalSelect,
	onAnimalRemove,
	onNext,
	error,
	dict,
}) => {
	// Render selected animals at the top
	const SelectedAnimalsDisplay = () => (
		<div className='flex justify-center gap-4 mb-8'>
			{selectedAnimals.map((animal, index) => (
				<motion.div
					key={`slot-${index}`}
					className={`w-24 h-24 rounded-xl flex items-center justify-center 
            ${
							animal
								? 'bg-white dark:bg-gray-700 shadow-lg'
								: 'border-2 border-dashed border-gray-300 dark:border-gray-600'
						}`}
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: index * 0.1 }}>
					{animal && (
						<div className='relative w-full h-full flex items-center justify-center'>
							<span className='text-4xl'>{animal.emoji}</span>
							<button
								onClick={() => onAnimalRemove(index)}
								className='absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600'
								aria-label={`Remove ${animal.label}`}>
								×
							</button>
						</div>
					)}
				</motion.div>
			))}
		</div>
	);

	// Group animals by their category
	const groupedAnimals = dict.auth.animalList.reduce((groups, animal) => {
		const { category } = animal; // Using 'category' instead of 'type'
		if (!groups[category]) {
			groups[category] = [];
		}
		groups[category].push(animal);
		return groups;
	}, {});

	// Define background colors for each category for visual differentiation
	const categoryStyles = {
		domestic: 'bg-yellow-100 dark:bg-yellow-900/20',
		wild: 'bg-green-100 dark:bg-green-900/20',
		unique: 'bg-blue-100 dark:bg-blue-900/20',
	};

	// Define emoji mapping (optional: consider adding 'emoji' to en.json)
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
		<div className='space-y-8'>
			<div className='text-center'>
				<h2 className='text-2xl font-bold text-gray-800 dark:text-white mb-2'>
					{dict.auth.selectAnimalsInOrder}
				</h2>
				<p className='text-gray-500 dark:text-gray-300'>
					{dict.auth.orderMatters}
				</p>
			</div>

			<SelectedAnimalsDisplay />

			{/* Animal Selection Groups */}
			{Object.keys(groupedAnimals).map((category) => (
				<div
					key={category}
					className='space-y-4'>
					<h3 className='text-lg font-semibold text-gray-700 dark:text-gray-200'>
						{dict.auth.animalCategories[category]}
					</h3>
					<div className='grid grid-cols-3 gap-4'>
						{groupedAnimals[category].map((animal) => {
							const isSelected = selectedAnimals.find(
								(a) => a.key === animal.key
							);
							const isDisabled = selectedAnimals.length >= 3 && !isSelected;

							return (
								<motion.button
									key={animal.key}
									onClick={() => onAnimalSelect(animal.key)}
									disabled={isDisabled}
									className={`aspect-square rounded-xl p-4 relative select-none
                    ${
											isSelected
												? `ring-2 ring-blue-500 ${categoryStyles[category]}`
												: isDisabled
												? 'bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed'
												: `bg-white dark:bg-gray-700 hover:ring-2 hover:ring-blue-500 hover:scale-105`
										}
                    transform transition-all duration-200 shadow-sm hover:shadow-md`}
									whileHover={!isDisabled ? { scale: 1.05 } : {}}
									whileTap={!isDisabled ? { scale: 0.95 } : {}}
									aria-label={`Select ${animal.label}`}>
									<div className='w-full h-full flex items-center justify-center text-4xl'>
										{emojiMapping[animal.key] || '🐾'}
									</div>
								</motion.button>
							);
						})}
					</div>
				</div>
			))}

			{error && (
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className='text-red-500 text-center'>
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
					className={`px-8 py-3 rounded-full font-semibold text-white
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
