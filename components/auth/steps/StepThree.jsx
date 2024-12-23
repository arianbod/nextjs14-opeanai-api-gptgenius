// components/auth/steps/StepThree.jsx
'use client';

import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

const StepThree = ({
	email,
	error,
	onEmailChange,
	onNext,
	dict,
	isSubmitting = false,
}) => {
	const [showCopyConfirmation, setShowCopyConfirmation] = useState(false);

	const handleSubmit = (e) => {
		e.preventDefault();
		onNext();
	};

	const handleShare = () => {
		const sequence = email;
		navigator.clipboard.writeText(sequence).then(() => {
			setShowCopyConfirmation(true);
			setTimeout(() => setShowCopyConfirmation(false), 3000);
		});
	};

	return (
		<>
			{/* Form Container */}
			<div className='space-y-8'>
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

				{/* Form Section */}
				<form
					onSubmit={handleSubmit}
					className='space-y-6'>
					{/* Email Input */}
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
							whileFocus={{ scale: 1.02 }}
						/>
						<FiMail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500' />
					</div>

					{/* Error Message */}
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
							onClick={() => onNext()}
							className='flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300'
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}>
							{dict.auth.skip}
						</motion.button>

						<motion.button
							type='submit'
							disabled={isSubmitting}
							className={`flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition duration-300 
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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

					{/* Decorative Separator */}
					<hr className='border-gray-300 dark:border-gray-600' />

					{/* Benefits Section */}
					<div className='mt-4'>
						<h3 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-4'>
							{dict.auth.emailBenefits.title}
						</h3>
						<ul className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400'>
							<li className='flex items-start gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded transition duration-300'>
								<FiCheckCircle className='mt-1 text-green-500' />{' '}
								{dict.auth.emailBenefits.recovery}
							</li>
							<li className='flex items-start gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded transition duration-300'>
								<FiCheckCircle className='mt-1 text-green-500' />{' '}
								{dict.auth.emailBenefits.security}
							</li>
							<li className='flex items-start gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded transition duration-300'>
								<FiCheckCircle className='mt-1 text-green-500' />{' '}
								{dict.auth.emailBenefits.updates}
							</li>
						</ul>
					</div>
				</form>

				{/* Share Confirmation */}
				<AnimatePresence>
					{showCopyConfirmation && (
						<motion.div
							className='fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg flex items-center gap-2'
							initial={{ opacity: 0, y: 50 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 50 }}
							transition={{ duration: 0.5 }}>
							<FiCheckCircle /> {dict.auth.shareConfirmation}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</>
	);
};

// Export the memoized component to prevent unnecessary re-renders
export default memo(StepThree);
