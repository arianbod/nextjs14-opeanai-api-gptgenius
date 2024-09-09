import React from 'react';
import { motion } from 'framer-motion';

const AILoadingIndicator = () => {
	return (
		<div className='flex items-center justify-center p-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-lg'>
			<motion.div
				className='flex space-x-2'
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5 }}>
				<motion.div
					className='w-3 h-3 bg-white rounded-full'
					animate={{
						scale: [1, 1.5, 1],
						opacity: [1, 0.5, 1],
					}}
					transition={{
						duration: 1,
						repeat: Infinity,
						repeatType: 'loop',
						ease: 'easeInOut',
						delay: 0,
					}}
				/>
				<motion.div
					className='w-3 h-3 bg-white rounded-full'
					animate={{
						scale: [1, 1.5, 1],
						opacity: [1, 0.5, 1],
					}}
					transition={{
						duration: 1,
						repeat: Infinity,
						repeatType: 'loop',
						ease: 'easeInOut',
						delay: 0.2,
					}}
				/>
				<motion.div
					className='w-3 h-3 bg-white rounded-full'
					animate={{
						scale: [1, 1.5, 1],
						opacity: [1, 0.5, 1],
					}}
					transition={{
						duration: 1,
						repeat: Infinity,
						repeatType: 'loop',
						ease: 'easeInOut',
						delay: 0.4,
					}}
				/>
			</motion.div>
			<motion.p
				className='ml-3 text-white font-medium'
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.5 }}>
				AI is thinking...
			</motion.p>
		</div>
	);
};

export default AILoadingIndicator;
