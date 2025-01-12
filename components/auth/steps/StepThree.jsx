'use client';

import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	FiMail,
	FiArrowRight,
	FiCheckCircle,
	FiGift,
	FiClock,
	FiPercent,
} from 'react-icons/fi';
import SkipConfirmationModal from './SkipConfirmationModal';

const StepThree = ({
	email,
	error,
	onEmailChange,
	onNext,
	dict,
	isSubmitting = false,
}) => {
	const [showCopyConfirmation, setShowCopyConfirmation] = useState(false);
	const [showSkipConfirmation, setShowSkipConfirmation] = useState(false);

	const handleSubmit = (e) => {
		e.preventDefault();
		onNext();
	};

	const handleSkip = () => {
		setShowSkipConfirmation(true);
	};

	const handleConfirmSkip = () => {
		setShowSkipConfirmation(false);
		onNext();
	};

	const handleCancelSkip = () => {
		setShowSkipConfirmation(false);
	};

	return (
		<>
			<div className='space-y-8 max-w-md w-full'>
				{/* Header Section */}
				<div className='text-center'>
					<motion.h2
						className='text-3xl font-extrabold text-gray-800 dark:text-white mb-2'
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}>
						{dict.auth.register.email}
					</motion.h2>
					<motion.p
						className='text-gray-500 dark:text-gray-300'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.3, duration: 0.6 }}>
						{dict.auth.register.emailOptional}
					</motion.p>
				</div>

				{/* Benefits Cards */}
				<div className='grid gap-4 mb-6'>
					<motion.div
						className='p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.2 }}>
						<div className='flex items-start gap-3'>
							<FiGift
								className='text-blue-500 mt-1'
								size={24}
							/>
							<div>
								<h3 className='font-semibold text-blue-700 dark:text-blue-300'>
									30x More Tokens
								</h3>
								<p className='text-sm text-blue-600 dark:text-blue-400'>
									Get 3000 tokens instead of 100 after email verification
								</p>
							</div>
						</div>
					</motion.div>

					<motion.div
						className='p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800'
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.3 }}>
						<div className='flex items-start gap-3'>
							<FiPercent
								className='text-green-500 mt-1'
								size={24}
							/>
							<div>
								<h3 className='font-semibold text-green-700 dark:text-green-300'>
									10% Bonus
								</h3>
								<p className='text-sm text-green-600 dark:text-green-400'>
									Get 10% extra tokens on every future recharge
								</p>
							</div>
						</div>
					</motion.div>

					<motion.div
						className='p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800'
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.4 }}>
						<div className='flex items-start gap-3'>
							<FiClock
								className='text-purple-500 mt-1'
								size={24}
							/>
							<div>
								<h3 className='font-semibold text-purple-700 dark:text-purple-300'>
									Early Access
								</h3>
								<p className='text-sm text-purple-600 dark:text-purple-400'>
									Get early access to new features and updates
								</p>
							</div>
						</div>
					</motion.div>
				</div>

				{/* Form Section */}
				<form
					onSubmit={handleSubmit}
					className='space-y-6'>
					<div className='relative'>
						<motion.input
							type='email'
							value={email}
							onChange={(e) => onEmailChange(e.target.value)}
							placeholder={dict.auth.register.emailPlaceholder}
							className={`w-full px-4 py-3 pl-12 rounded-lg border transition duration-300 
                                ${
																	error
																		? 'border-red-500 focus:border-red-500 focus:ring-red-200'
																		: 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200'
																} 
                                bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                                placeholder-gray-400 dark:placeholder-gray-500 
                                outline-none`}
						/>
						<FiMail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500' />
					</div>

					<AnimatePresence>
						{error && (
							<motion.p
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								className='text-red-500 text-sm flex items-center gap-1'>
								<FiCheckCircle className='text-red-500' /> {error}
							</motion.p>
						)}
					</AnimatePresence>

					{/* Action Buttons */}
					<div className='flex flex-col sm:flex-row gap-4'>
						<motion.button
							type='button'
							onClick={handleSkip}
							className='flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300'
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}>
							{dict.auth.skip}
						</motion.button>

						<motion.button
							type='submit'
							disabled={isSubmitting}
							className={`flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition duration-300 
                                ${
																	isSubmitting
																		? 'opacity-50 cursor-not-allowed'
																		: ''
																}`}
							whileHover={!isSubmitting ? { scale: 1.05 } : {}}
							whileTap={!isSubmitting ? { scale: 0.95 } : {}}>
							{isSubmitting ? (
								dict.auth.register.submitting
							) : (
								<>
									{dict.auth.continue} <FiArrowRight />
								</>
							)}
						</motion.button>
					</div>
				</form>
			</div>

			{/* Skip Confirmation Modal */}
			<AnimatePresence>
				{showSkipConfirmation && (
					<SkipConfirmationModal
						onConfirm={handleConfirmSkip}
						onCancel={handleCancelSkip}
						dict={dict}
					/>
				)}
			</AnimatePresence>
		</>
	);
};

export default memo(StepThree);
