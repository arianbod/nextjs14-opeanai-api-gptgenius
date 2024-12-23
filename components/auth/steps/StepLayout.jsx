'use client';

import React, { memo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Animated background circles component
const AnimatedBackground = () => {
	const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

	useEffect(() => {
		// Set dimensions after component mounts
		setDimensions({
			width: window.innerWidth,
			height: window.innerHeight,
		});

		// Optional: Update dimensions on window resize
		const handleResize = () => {
			setDimensions({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<div className='fixed inset-0 overflow-hidden -z-10'>
			<div className='absolute inset-0 opacity-30'>
				{[...Array(5)].map((_, i) => (
					<motion.div
						key={i}
						className='absolute rounded-full bg-gradient-to-r from-blue-400 to-purple-500'
						initial={{
							scale: Math.random() * 0.5 + 0.5,
							x: Math.random() * dimensions.width,
							y: Math.random() * dimensions.height,
						}}
						animate={{
							x: [
								Math.random() * dimensions.width,
								Math.random() * dimensions.width,
								Math.random() * dimensions.width,
							],
							y: [
								Math.random() * dimensions.height,
								Math.random() * dimensions.height,
								Math.random() * dimensions.height,
							],
							scale: [
								Math.random() * 0.5 + 0.5,
								Math.random() * 0.5 + 1,
								Math.random() * 0.5 + 0.5,
							],
						}}
						transition={{
							duration: Math.random() * 20 + 20,
							repeat: Infinity,
							ease: 'linear',
						}}
						style={{
							width: Math.random() * 300 + 100,
							height: Math.random() * 300 + 100,
							filter: 'blur(80px)',
						}}
					/>
				))}
			</div>
		</div>
	);
};

// Step indicator component
const StepIndicator = ({ currentStep, totalSteps }) => {
	return (
		<div className='fixed top-8 left-1/2 transform -translate-x-1/2 flex gap-2'>
			{[...Array(totalSteps)].map((_, i) => (
				<motion.div
					key={i}
					className={`h-2 rounded-full ${
						i === currentStep
							? 'w-8 bg-blue-500'
							: 'w-2 bg-gray-300 dark:bg-gray-600'
					}`}
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: i * 0.1 }}
				/>
			))}
		</div>
	);
};

const StepLayout = ({
	children,
	currentStep,
	totalSteps,
	onBack,
	showBackButton = true,
}) => {
	return (
		<div className='min-h-screen flex items-center justify-center p-4 relative overflow-hidden'>
			<AnimatedBackground />

			<div className='w-full max-w-xl relative'>
				<StepIndicator
					currentStep={currentStep}
					totalSteps={totalSteps}
				/>

				{showBackButton && currentStep > 0 && (
					<motion.button
						onClick={onBack}
						className='absolute top-4 left-4 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white'
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}>
						← Back
					</motion.button>
				)}

				<div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl'>
					<AnimatePresence mode='wait'>
						<motion.div
							key={currentStep}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.3 }}>
							{children}
						</motion.div>
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
};

export default memo(StepLayout);
