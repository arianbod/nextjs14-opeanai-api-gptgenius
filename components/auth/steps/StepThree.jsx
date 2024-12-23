// components/auth/steps/StepThree.jsx
'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiArrowRight } from 'react-icons/fi';

const StepThree = ({
	email,
	error,
	onEmailChange,
	onNext,
	dict,
	isSubmitting = false,
}) => {
	const handleSubmit = (e) => {
		e.preventDefault();
		onNext();
	};

	return (
		<div className='space-y-8'>
			<div className='text-center'>
				<h2 className='text-2xl font-bold text-gray-800 dark:text-white mb-2'>
					{dict.auth.register.email}
				</h2>
				<p className='text-gray-500 dark:text-gray-300'>
					{dict.auth.register.emailOptional}
				</p>
			</div>

			<form
				onSubmit={handleSubmit}
				className='space-y-6'>
				<div className='space-y-4'>
					<div className='relative'>
						<input
							type='email'
							value={email}
							onChange={(e) => onEmailChange(e.target.value)}
							placeholder={dict.auth.register.emailPlaceholder}
							className={`w-full px-4 py-3 pl-10 rounded-lg border ${
								error
									? 'border-red-500'
									: 'border-gray-300 dark:border-gray-600'
							} bg-white dark:bg-gray-800`}
						/>
						<FiMail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
					</div>

					{error && (
						<motion.p
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							className='text-red-500 text-sm'>
							{error}
						</motion.p>
					)}
				</div>

				<div className='flex justify-between gap-4'>
					<button
						type='button'
						onClick={() => onNext()}
						className='flex-1 px-6 py-3 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600'>
						{dict.auth.skip}
					</button>

					<button
						type='submit'
						disabled={isSubmitting}
						className='flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2'>
						{isSubmitting ? (
							dict.auth.register.submitting
						) : (
							<>
								{dict.auth.continue} <FiArrowRight />
							</>
						)}
					</button>
				</div>

				<div className='mt-4'>
					<h3 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
						{dict.auth.emailBenefits.title}
					</h3>
					<ul className='space-y-2 text-sm text-gray-500 dark:text-gray-400'>
						<li>• {dict.auth.emailBenefits.recovery}</li>
						<li>• {dict.auth.emailBenefits.security}</li>
						<li>• {dict.auth.emailBenefits.updates}</li>
					</ul>
				</div>
			</form>
		</div>
	);
};

export default memo(StepThree);
