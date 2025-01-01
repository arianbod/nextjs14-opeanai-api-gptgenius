'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from '@/context/TranslationContext';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiLoader } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const SuccessPage = () => {
	const router = useRouter();
	const { dict } = useTranslations();
	const { setTokenBalance } = useAuth();
	const searchParams = useSearchParams();
	const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
	const [error, setError] = useState('');

	useEffect(() => {
		const checkPayment = async () => {
			try {
				const sessionId = searchParams.get('session_id');
				const tokens = searchParams.get('tokens');

				console.log('Checking payment status:', { sessionId, tokens });

				if (!sessionId) {
					console.error('No session ID found in URL');
					setStatus('error');
					setError('Invalid session');
					return;
				}

				// Add delay to ensure Stripe has processed the payment
				await new Promise((resolve) => setTimeout(resolve, 2000));

				const response = await fetch(
					`/api/payment/stripe/verify?session_id=${sessionId}`
				);
				const data = await response.json();

				console.log('Payment verification response:', data);

				if (data.error) {
					setStatus('error');
					setError(data.error);
					return;
				}

				if (data.paid) {
					setStatus('success');
					// Update local token balance
					setTokenBalance((prev) => prev + parseInt(tokens));

					// Show success message
					toast.success('Payment successful! Tokens added to your account.');

					// Redirect after 3 seconds
					setTimeout(() => {
						router.push('/profile');
					}, 3000);
				} else {
					setStatus('error');
					setError('Payment verification failed');
				}
			} catch (error) {
				console.error('Error checking payment:', error);
				setStatus('error');
				setError('Failed to verify payment');
			}
		};

		checkPayment();
	}, [router, searchParams, setTokenBalance]);

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
							Please wait while we confirm your payment
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
							Your tokens have been added to your account. You will be
							redirected shortly.
						</p>
					</>
				);

			case 'error':
				return (
					<>
						<div className='w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6'>
							<span className='text-red-500 text-4xl'>✕</span>
						</div>
						<h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
							Payment Verification Failed
						</h1>
						<p className='text-red-500 mb-6'>{error}</p>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => router.push('/token')}
							className='px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'>
							Try Again
						</motion.button>
					</>
				);
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center'>
			<motion.div
				initial={{ scale: 0.8, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				className='bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center max-w-md mx-4'>
				{renderContent()}
			</motion.div>
		</div>
	);
};

export default SuccessPage;
