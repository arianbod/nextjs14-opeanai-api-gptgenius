// components/auth/steps/SaveTokenModal.jsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCopy, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const SaveTokenModal = ({
	token,
	animalSelection,
	hasSavedToken,
	setHasSavedToken,
	onClose,
	isNewUser,
	lang,
	dict,
}) => {
	const copyToken = () => {
		if (token) {
			navigator.clipboard
				.writeText(token)
				.then(() => toast.success(dict.auth.tokenCopied))
				.catch(() => toast.error(dict.auth.errors.copyFailed));
		}
	};

	return (
		<AnimatePresence>
			<motion.div
				className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}>
				<motion.div
					className='bg-white dark:bg-gray-800 rounded-3xl p-10 max-w-lg w-full mx-4 relative shadow-lg'
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					exit={{ scale: 0.8, opacity: 0 }}
					transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
					<div className='space-y-8'>
						{/* Header Section */}
						<div className='text-center'>
							<motion.h2
								className='text-3xl font-bold text-gray-800 dark:text-white mb-2'
								initial={{ opacity: 0, y: -20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6 }}>
								{dict.auth.saveToken}
							</motion.h2>
							<motion.p
								className='text-gray-500 dark:text-gray-300'
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.3, duration: 0.6 }}>
								{dict.auth.tokenImportant}
							</motion.p>
						</div>

						{/* Token Display Section */}
						<div className='bg-gray-50 dark:bg-gray-700 rounded-xl p-6'>
							<div className='flex justify-between items-center mb-4'>
								<span className='text-sm text-gray-500 dark:text-gray-400'>
									{dict.auth.yourToken}
								</span>
								<motion.button
									onClick={copyToken}
									className='text-blue-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors duration-300'
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.9 }}
									aria-label='Copy Token'>
									<FiCopy size={20} />
								</motion.button>
							</div>
							<div className=' text-sm break-all bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600'>
								{token}
							</div>
						</div>

						{/* Animal Selection Section */}
						<div className='bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6'>
							<h3 className='font-semibold text-yellow-800 dark:text-yellow-200 mb-4'>
								{dict.auth.rememberAnimalOrder}
							</h3>
							<div className='flex gap-4 flex-wrap justify-center'>
								{animalSelection.map((animal, index) => (
									<motion.div
										key={index}
										className='px-4 py-2 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center gap-2'
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.9 }}>
										<span className='font-medium'>{index + 1}.</span>
										<motion.span
											className='text-2xl'
											animate={{ y: [0, -5, 0] }}
											transition={{
												repeat: Infinity,
												repeatType: 'loop',
												duration: 1.5,
												ease: 'easeInOut',
												delay: index * 0.2,
											}}>
											{animal.emoji}
										</motion.span>
									</motion.div>
								))}
							</div>
						</div>

						{/* Confirmation Checkbox */}
						<div className='flex items-center gap-3'>
							<input
								type='checkbox'
								id='tokenSaved'
								checked={hasSavedToken}
								onChange={(e) => setHasSavedToken(e.target.checked)}
								className='w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
							/>
							<label
								htmlFor='tokenSaved'
								className='text-sm text-gray-600 dark:text-gray-300 cursor-pointer'>
								{dict.auth.confirmTokenSaved}
							</label>
						</div>

						{/* Action Button */}
						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							onClick={onClose}
							disabled={!hasSavedToken}
							className={`w-full py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 
                ${
									hasSavedToken
										? 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
										: 'bg-gray-400 cursor-not-allowed'
								} transition-colors duration-300`}>
							<FiCheckCircle />
							{dict.auth.continue}
						</motion.button>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
};

export default SaveTokenModal;
