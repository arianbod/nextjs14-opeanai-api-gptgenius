import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const CooldownChallenge = ({ failedAttempts, onComplete }) => {
	const [pattern, setPattern] = useState([]);
	const [userPattern, setUserPattern] = useState([]);
	const [cooldownTime, setCooldownTime] = useState(0);
	const [isCompleted, setIsCompleted] = useState(false);

	const animals = [
		'🐶',
		'🐱',
		'🐘',
		'🦁',
		'🐯',
		'🐻',
		'🐒',
		'🦒',
		'🦓',
		'🐧',
		'🦘',
		'🐨',
	];

	// Get challenge difficulty based on failed attempts
	const getDifficulty = () => {
		if (failedAttempts <= 3) return { size: 4, time: 30 };
		if (failedAttempts <= 5) return { size: 6, time: 120 };
		return { size: 9, time: 300 };
	};

	useEffect(() => {
		const { size, time } = getDifficulty();
		// Generate random pattern
		const newPattern = Array.from(
			{ length: size },
			() => animals[Math.floor(Math.random() * animals.length)]
		);
		setPattern(newPattern);
		setCooldownTime(time);

		// Show pattern for 3 seconds
		const timer = setTimeout(() => setPattern([]), 3000);
		return () => clearTimeout(timer);
	}, [failedAttempts]);

	useEffect(() => {
		if (cooldownTime > 0) {
			const timer = setInterval(() => {
				setCooldownTime((t) => t - 1);
			}, 1000);
			return () => clearInterval(timer);
		}
	}, [cooldownTime]);

	const handleAnimalClick = (animal) => {
		if (isCompleted || cooldownTime === 0) return;

		const newUserPattern = [...userPattern, animal];
		setUserPattern(newUserPattern);

		// Check if pattern is complete
		if (newUserPattern.length === pattern.length) {
			const isCorrect = newUserPattern.every((a, i) => a === pattern[i]);
			if (isCorrect) {
				setIsCompleted(true);
				onComplete();
			} else {
				setUserPattern([]);
				// Generate new pattern
				const { size } = getDifficulty();
				const newPattern = Array.from(
					{ length: size },
					() => animals[Math.floor(Math.random() * animals.length)]
				);
				setPattern(newPattern);
				setTimeout(() => setPattern([]), 3000);
			}
		}
	};

	return (
		<div className='flex flex-col items-center gap-6 p-6 bg-white rounded-lg shadow-xl max-w-md mx-auto'>
			<h3 className='text-xl font-semibold text-gray-800'>
				Security Challenge
			</h3>

			{cooldownTime > 0 ? (
				<>
					<div className='text-gray-600 text-center'>
						<p className='mb-2'>Memorize the pattern:</p>
						<div className='grid grid-cols-3 gap-4 mb-4'>
							{pattern.length > 0 ? (
								pattern.map((animal, i) => (
									<motion.div
										key={i}
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										className='w-16 h-16 flex items-center justify-center text-2xl bg-blue-50 rounded-lg'>
										{animal}
									</motion.div>
								))
							) : (
								<div className='col-span-3 text-center'>
									<p>Now recreate the pattern!</p>
									<div className='grid grid-cols-4 gap-2 mt-4'>
										{animals.map((animal, i) => (
											<motion.button
												key={i}
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.9 }}
												onClick={() => handleAnimalClick(animal)}
												className='w-12 h-12 flex items-center justify-center text-xl bg-gray-50 rounded-lg hover:bg-gray-100'>
												{animal}
											</motion.button>
										))}
									</div>
								</div>
							)}
						</div>
					</div>

					<div className='text-center'>
						<p className='text-gray-500'>Cooldown Timer:</p>
						<p className='text-2xl font-bold text-blue-600'>
							{Math.floor(cooldownTime / 60)}:
							{(cooldownTime % 60).toString().padStart(2, '0')}
						</p>
					</div>

					{userPattern.length > 0 && (
						<div className='flex gap-2'>
							{userPattern.map((animal, i) => (
								<motion.div
									key={i}
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									className='w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg'>
									{animal}
								</motion.div>
							))}
						</div>
					)}
				</>
			) : (
				<div className='text-center text-gray-600'>
					<p>Challenge time expired.</p>
					<p>Please try again later.</p>
				</div>
			)}
		</div>
	);
};

export default CooldownChallenge;
