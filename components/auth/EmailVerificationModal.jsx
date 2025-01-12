'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiCheck, FiX, FiGift } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

const EmailVerificationModal = ({ email, onClose, dict }) => {
	const [verificationCode, setVerificationCode] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { verifyEmail, tokenBalance, syncTokenBalance } = useAuth();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const result = await verifyEmail(verificationCode);
			if (result.success) {
				await syncTokenBalance(); // Sync the new token balance
				toast.success(result.message);
				onClose();
			} else {
				toast.error(result.message || dict.auth.errors.verificationFailed);
			}
		} catch (error) {
			console.error('Verification error:', error);
			toast.error(dict.auth.errors.verificationFailed);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.9 }}
				className='bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl relative'>
				<button
					onClick={onClose}
					className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'>
					<FiX size={24} />
				</button>

				<div className='text-center mb-6'>
					<div className='mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4'>
						<FiMail className='w-8 h-8 text-blue-500' />
					</div>
					<h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
						{dict.auth.verifyEmail.title}
					</h2>
					<p className='text-gray-600 dark:text-gray-300'>
						{dict.auth.verifyEmail.description.replace('{email}', email)}
					</p>
				</div>

				{/* Token Bonus Alert */}
				<div className='mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800'>
					<div className='flex items-start gap-3'>
						<FiGift
							className='text-green-500 mt-1'
							size={24}
						/>
						<div>
							<h3 className='font-semibold text-green-700 dark:text-green-300'>
								{dict.auth.verifyEmail.tokenBonus}
							</h3>
							<p className='text-sm text-green-600 dark:text-green-400'>
								{dict.auth.verifyEmail.tokenBonusDescription}
							</p>
						</div>
					</div>
				</div>

				<form
					onSubmit={handleSubmit}
					className='space-y-4'>
					<div>
						<input
							type='text'
							value={verificationCode}
							onChange={(e) => setVerificationCode(e.target.value)}
							placeholder={dict.auth.verifyEmail.codePlaceholder}
							className='w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							required
						/>
					</div>

					<button
						type='submit'
						disabled={isSubmitting}
						className={`w-full py-3 rounded-lg bg-blue-500 text-white font-medium
                                 flex items-center justify-center gap-2
                                 ${
																		isSubmitting
																			? 'opacity-50 cursor-not-allowed'
																			: 'hover:bg-blue-600'
																	}`}>
						{isSubmitting ? (
							<>
								<div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
								{dict.auth.verifyEmail.verifying}
							</>
						) : (
							<>
								<FiCheck /> {dict.auth.verifyEmail.verify}
							</>
						)}
					</button>

					<button
						type='button'
						onClick={onClose}
						className='w-full py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'>
						{dict.auth.verifyEmail.skip}
					</button>
				</form>
			</motion.div>
		</div>
	);
};

export default EmailVerificationModal;
