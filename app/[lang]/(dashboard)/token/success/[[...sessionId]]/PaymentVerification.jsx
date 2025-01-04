'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import {
	FiLoader,
	FiCheckCircle,
	FiAlertTriangle,
	FiRefreshCw,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export function PaymentVerification({ sessionId }) {
	const router = useRouter();
	const { setTokenBalance } = useAuth();
	const [status, setStatus] = useState('loading');
	const [error, setError] = useState('');
	const [verificationAttempts, setVerificationAttempts] = useState(0);
	const maxAttempts = 3;
	const retryDelay = 2000;

	const verifyPayment = async (sid) => {
		try {
			const response = await fetch(
				`/api/payment/stripe/verify?session_id=${sid}`,
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			if (data.error) {
				throw new Error(data.error);
			}

			return data;
		} catch (error) {
			console.error('Verification request failed:', error);
			throw error;
		}
	};

	const handleVerification = async (isRetry = false) => {
		try {
			if (!sessionId) {
				setStatus('error');
				setError('Invalid session');
				return;
			}

			if (isRetry) {
				setVerificationAttempts(0);
			} else if (verificationAttempts > 0) {
				await new Promise((resolve) => setTimeout(resolve, retryDelay));
			}

			const result = await verifyPayment(sessionId);

			if (result.paid) {
				setTokenBalance((prev) => prev + result.tokenAmount);
				setStatus('success');
				toast.success('Payment successful! Tokens added to your account.');

				setTimeout(() => {
					router.push('/');
				}, 3000);
			} else if (result.status === 'failed' || result.status === 'canceled') {
				setStatus('error');
				setError(
					result.status === 'failed'
						? 'Payment failed. Please try again.'
						: 'Payment was canceled.'
				);
			} else if (verificationAttempts < maxAttempts - 1) {
				setVerificationAttempts((prev) => prev + 1);
				handleVerification();
			} else {
				setStatus('error');
				setError(
					'Payment verification timed out. Please try manual verification.'
				);
			}
		} catch (error) {
			console.error('Error verifying payment:', error);
			setStatus('error');
			setError(error.message || 'Failed to verify payment');
		}
	};

	useEffect(() => {
		handleVerification();
	}, [sessionId]);

	const renderContent = () => {
		switch (status) {
			case 'loading':
				return (
					<>
						<motion.div
							animate={{ rotate: 360 }}
							transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
							className='w-20 h-20 flex items-center justify-center mx-auto mb-6'>
							<FiLoader className='w-12 h-12 text-blue-500' />
						</motion.div>
						<h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
							Verifying Payment...
						</h1>
						<p className='text-gray-600 dark:text-gray-300'>
							{verificationAttempts > 0
								? `Retry attempt ${
										verificationAttempts + 1
								  } of ${maxAttempts}...`
								: 'Please wait while we confirm your payment'}
						</p>
					</>
				);

			case 'success':
				return (
					<>
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							className='w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6'>
							<FiCheckCircle className='w-12 h-12 text-green-500' />
						</motion.div>
						<h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
							Payment Successful!
						</h1>
						<p className='text-gray-600 dark:text-gray-300 mb-6'>
							Your tokens have been added to your account.
							<br />
							Redirecting you shortly...
						</p>
					</>
				);

			case 'error':
				return (
					<>
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							className='w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6'>
							<FiAlertTriangle className='w-12 h-12 text-red-500' />
						</motion.div>
						<h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
							Payment Verification Failed
						</h1>
						<p className='text-red-500 mb-6'>{error}</p>
						<div className='flex flex-col sm:flex-row gap-4 justify-center'>
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => handleVerification(true)}
								className='px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2'>
								<FiRefreshCw className='w-4 h-4' />
								Verify Again
							</motion.button>
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => router.push('/token')}
								className='px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors'>
								Back to Tokens
							</motion.button>
						</div>
						<p className='mt-6 text-sm text-gray-500 dark:text-gray-400'>
							Session ID: {sessionId}
							<br />
							Please contact support if the problem persists.
						</p>
					</>
				);
		}
	};

	return renderContent();
}
