// components/auth/steps/TokenConfirmation.jsx
'use client';

import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const TokenConfirmation = ({
	isLogin,
	token,
	error,
	onTokenInput,
	onComplete,
	isSubmitting,
	dict,
	selectedAnimals,
	readOnly = false, // New prop for registration flow
}) => {
	const [showToken, setShowToken] = useState(false);
	const [hasConfirmedSave, setHasConfirmedSave] = useState(false);

	const handleCopyToken = () => {
		const tokenToCopy = isLogin ? token : token;
		if (!tokenToCopy) {
			toast.error('No token available to copy');
			return;
		}

		navigator.clipboard
			.writeText(tokenToCopy)
			.then(() => toast.success(dict.auth.tokenCopied))
			.catch(() => toast.error('Failed to copy token'));
	};

	return (
		<div className='space-y-6'>
			<div className='text-center'>
				<h2 className='text-2xl font-bold text-gray-800 dark:text-white mb-2'>
					{isLogin ? dict.auth.login.title : dict.auth.saveToken}
				</h2>
				<p className='text-gray-500 dark:text-gray-300'>
					{isLogin
						? dict.auth.login.tokenPlaceholder
						: dict.auth.tokenImportant}
				</p>
			</div>

			<div className='bg-white dark:bg-gray-700 p-4 rounded-lg space-y-2'>
				{isLogin ? (
					// Login mode - show input
					<div className='relative'>
						<input
							type={showToken ? 'text' : 'password'}
							value={token}
							onChange={(e) => onTokenInput(e.target.value)}
							placeholder={dict.auth.login.tokenPlaceholder}
							className={`w-full px-4 py-3 rounded-lg border ${
								error
									? 'border-red-500'
									: 'border-gray-300 dark:border-gray-600'
							} bg-white dark:bg-gray-800`}
						/>
					</div>
				) : (
					// Registration mode - show display only
					<div className='font-mono text-sm break-all bg-gray-50 dark:bg-gray-800 p-3 rounded'>
						{showToken ? token : '•'.repeat(40)}
					</div>
				)}

				{/* Token controls */}
				<div className='flex justify-end gap-2'>
					<button
						onClick={() => setShowToken(!showToken)}
						className='p-2 text-gray-400 hover:text-gray-600'>
						{showToken ? <FiEyeOff /> : <FiEye />}
					</button>
					<button
						onClick={handleCopyToken}
						className='p-2 text-gray-400 hover:text-gray-600'>
						<FiCopy />
					</button>
				</div>
			</div>

			{/* Animal sequence reminder */}
			<div className='bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4'>
				<h3 className='font-semibold text-yellow-800 dark:text-yellow-200 mb-2'>
					{dict.auth.rememberAnimalOrder}
				</h3>
				<div className='flex gap-2 flex-wrap justify-center'>
					{selectedAnimals.map((animal, index) => (
						<div
							key={index}
							className='px-3 py-1 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center gap-1'>
							<span className='font-medium'>{index + 1}.</span>
							<span>{animal.emoji}</span>
						</div>
					))}
				</div>
			</div>

			{!isLogin && (
				<div className='flex items-center gap-2'>
					<input
						type='checkbox'
						checked={hasConfirmedSave}
						onChange={(e) => setHasConfirmedSave(e.target.checked)}
						className='w-4 h-4 rounded border-gray-300'
					/>
					<span className='text-sm text-gray-600 dark:text-gray-300'>
						{dict.auth.confirmTokenSaved}
					</span>
				</div>
			)}

			{(isLogin || hasConfirmedSave) && onComplete && (
				<button
					onClick={onComplete}
					disabled={isSubmitting || (!isLogin && !hasConfirmedSave)}
					className={`w-full py-3 rounded-xl text-white font-medium
            ${
							isSubmitting || (!isLogin && !hasConfirmedSave)
								? 'bg-gray-400 cursor-not-allowed'
								: 'bg-blue-500 hover:bg-blue-600'
						}`}>
					<FiCheckCircle className='inline mr-2' />
					{isSubmitting ? dict.auth.submitting : dict.auth.continue}
				</button>
			)}
		</div>
	);
};

export default memo(TokenConfirmation);
