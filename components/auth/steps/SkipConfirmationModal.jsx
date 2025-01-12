'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle, FiGift, FiPercent, FiClock } from 'react-icons/fi';

const SkipConfirmationModal = ({ onConfirm, onCancel, dict }) => {
	return (
		<div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.95 }}
				className='bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl'>
				{/* Header */}
				<div className='text-center mb-6'>
					<div className='mx-auto w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4'>
						<FiAlertCircle className='w-6 h-6 text-yellow-500' />
					</div>
					<h2 className='text-xl font-bold text-gray-900 dark:text-white'>
						Are you sure you want to skip?
					</h2>
					<p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
						You'll miss out on these amazing benefits:
					</p>
				</div>

				{/* Benefits List */}
				<div className='space-y-3 mb-6'>
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.1 }}
						className='flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
						<FiGift className='text-blue-500 flex-shrink-0' />
						<div className='text-sm'>
							<span className='font-semibold text-blue-700 dark:text-blue-300'>
								30x More Tokens
							</span>
							<p className='text-blue-600 dark:text-blue-400'>
								Get 3000 tokens instead of 100
							</p>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.2 }}
						className='flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg'>
						<FiPercent className='text-green-500 flex-shrink-0' />
						<div className='text-sm'>
							<span className='font-semibold text-green-700 dark:text-green-300'>
								10% Extra on Recharges
							</span>
							<p className='text-green-600 dark:text-green-400'>
								Permanent bonus on all future recharges
							</p>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.3 }}
						className='flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg'>
						<FiClock className='text-purple-500 flex-shrink-0' />
						<div className='text-sm'>
							<span className='font-semibold text-purple-700 dark:text-purple-300'>
								Priority Access
							</span>
							<p className='text-purple-600 dark:text-purple-400'>
								Early access to new features
							</p>
						</div>
					</motion.div>
				</div>

				{/* Action Buttons */}
				<div className='flex flex-col sm:flex-row gap-3'>
					<button
						onClick={onConfirm}
						className='flex-1 px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'>
						Skip Anyway
					</button>
					<button
						onClick={onCancel}
						className='flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'>
						Go Back
					</button>
				</div>
			</motion.div>
		</div>
	);
};

export default SkipConfirmationModal;
