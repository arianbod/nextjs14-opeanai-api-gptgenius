// components/auth/steps/TokenConfirmation.jsx
'use client';

import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCopy, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import LocaleLink from '@/components/hoc/LocalLink';

const TokenConfirmation = ({
	isLogin,
	token,
	error,
	onTokenInput,
	onComplete,
	isSubmitting,
	dict,
	selectedAnimals,
	readOnly = false,
	hasEmail = false,
}) => {
	const [showToken, setShowToken] = useState(false);
	const [hasConfirmedSave, setHasConfirmedSave] = useState(false);

	const handleCopyToken = () => {
		if (!token) {
			toast.error('No token available to copy');
			return;
		}

		navigator.clipboard
			.writeText(token)
			.then(() => {
				toast.success(dict.auth.tokenCopied);
				if (!isLogin && !hasEmail) {
					setHasConfirmedSave(true); // Auto-confirm when user copies token
				}
			})
			.catch(() => toast.error('Failed to copy token'));
	};

	// Different UI based on login/register and email/non-email
	const renderTokenInput = () => {
		if (isLogin) {
			return (
				<div className='relative'>
					<motion.input
						type={showToken ? 'text' : 'password'}
						value={token}
						onChange={(e) => onTokenInput(e.target.value)}
						placeholder={dict.auth.login.tokenPlaceholder}
						className={`w-full px-4 py-3 pl-12 rounded-lg border transition duration-300 
              ${
								error
									? 'border-red-500 focus:border-red-500 focus:ring-red-200'
									: 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200'
							} 
              bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
					/>
					<button
						onClick={() => setShowToken(!showToken)}
						className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 focus:outline-none'
						aria-label={showToken ? 'Hide Token' : 'Show Token'}>
						{showToken ? <FiEyeOff size={20} /> : <FiEye size={20} />}
					</button>
				</div>
			);
		}

		// For registration, show token display
		return (
			<div className='relative'>
				<motion.div
					className=' text-sm break-all bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600'
					initial={{ opacity: 0.8 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}>
					{showToken ? token : '•'.repeat(40)}
				</motion.div>
				<button
					onClick={() => setShowToken(!showToken)}
					className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 focus:outline-none'
					aria-label={showToken ? 'Hide Token' : 'Show Token'}>
					{showToken ? <FiEyeOff size={20} /> : <FiEye size={20} />}
				</button>
			</div>
		);
	};

	return (
		<div className='space-y-8'>
			{/* Header Section */}
			<div className='text-center'>
				<motion.h2
					className='text-3xl font-extrabold text-gray-800 dark:text-white mb-2'
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}>
					{isLogin ? dict.auth.login.title : dict.auth.saveToken}
				</motion.h2>
				<motion.p
					className='text-gray-500 dark:text-gray-300'
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3, duration: 0.6 }}>
					{isLogin
						? dict.auth.login.tokenPlaceholder
						: dict.auth.tokenImportant}
				</motion.p>
			</div>

			{/* Token Display Section */}
			<div className='bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-md'>
				{renderTokenInput()}

				<div className='flex justify-end gap-4 mt-4'>
					<motion.button
						onClick={handleCopyToken}
						className='flex items-center text-blue-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors duration-300'
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						aria-label='Copy Token'>
						<FiCopy size={20} />
						<span className='ml-1 text-sm'>{dict.auth.copyToken}</span>
					</motion.button>
				</div>
			</div>

			{/* Animal Selection Section */}
			<div className='bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6'>
				<h3 className='font-semibold text-yellow-800 dark:text-yellow-200 mb-4 text-lg text-center'>
					{dict.auth.rememberAnimalOrder}
				</h3>
				<div className='flex gap-4 flex-wrap justify-center'>
					{selectedAnimals.map((animal, index) => (
						<motion.div
							key={index}
							className='px-4 py-2 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center gap-2'
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}>
							<span className='font-medium'>{index + 1}.</span>
							<span className='text-3xl'>{animal.emoji}</span>
						</motion.div>
					))}
				</div>
			</div>

			{/* Confirmation Checkbox - Only show during registration */}
			{!isLogin && (
				<div className='flex items-center gap-3'>
					<input
						type='checkbox'
						id='tokenSaved'
						checked={hasConfirmedSave}
						onChange={(e) => setHasConfirmedSave(e.target.checked)}
						className='w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
					/>
					<label
						htmlFor='tokenSaved'
						className='text-sm text-gray-600 dark:text-gray-300 cursor-pointer'>
						{dict.auth.confirmTokenSaved}
					</label>
				</div>
			)}

			{/* Action Button */}
			{(isLogin || (!isLogin && hasConfirmedSave)) && (
				<LocaleLink
					href='/chat'
					onClick={() => {
						if (isLogin) {
							onComplete();
						} else {
							// For registration, we just want to close/proceed
							// The handler is optional for registration flow
							if (onComplete) {
								onComplete();
							}
						}
					}}
					disabled={isSubmitting || (!isLogin && !hasConfirmedSave)}
					whileHover={{ scale: !isSubmitting && 1.02 }}
					whileTap={{ scale: !isSubmitting && 0.98 }}
					className={`w-full py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 
            ${
							isSubmitting || (!isLogin && !hasConfirmedSave)
								? 'bg-gray-400 cursor-not-allowed'
								: 'bg-blue-500 hover:bg-blue-600'
						} transition-colors duration-300`}>
					<FiCheckCircle className='inline' />
					{isSubmitting ? dict.auth.submitting : dict.auth.continue}
				</LocaleLink>
			)}

			{/* Error Message */}
			{error && (
				<AnimatePresence>
					<motion.p
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className='text-red-500 text-center mt-2'>
						{error}
					</motion.p>
				</AnimatePresence>
			)}
		</div>
	);
};

export default memo(TokenConfirmation);
