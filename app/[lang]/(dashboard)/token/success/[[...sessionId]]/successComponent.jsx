'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { FiLoader } from 'react-icons/fi';
import { PaymentVerification } from './PaymentVerification';

function ClientSuccessPage({ sessionId }) {
	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900'>
			<motion.div
				initial={{ scale: 0.8, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				className='bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center max-w-md mx-4'>
				<Suspense fallback={<LoadingFallback />}>
					<PaymentVerification sessionId={sessionId} />
				</Suspense>
			</motion.div>
		</div>
	);
}

const LoadingFallback = () => (
	<div className='w-20 h-20 flex items-center justify-center mx-auto'>
		<FiLoader className='w-12 h-12 text-blue-500 animate-spin' />
	</div>
);
export default ClientSuccessPage;
