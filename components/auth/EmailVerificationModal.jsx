import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiCheckCircle } from 'react-icons/fi';

const EmailVerificationModal = ({ email, onClose, dict }) => {
	return (
		<AnimatePresence>
			<motion.div
				className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}>
				<motion.div
					className='bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 relative'
					initial={{ scale: 0.9, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					exit={{ scale: 0.9, opacity: 0 }}>
					<div className='flex flex-col items-center gap-4'>
						<div className='w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center'>
							<FiMail className='w-8 h-8 text-blue-500' />
						</div>

						<h2 className='text-xl font-bold text-gray-900 dark:text-white'>
							{dict.auth.verifyEmail}
						</h2>

						<p className='text-center text-gray-600 dark:text-gray-300'>
							{dict.auth.verificationSent.replace('{email}', email)}
						</p>

						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							onClick={onClose}
							className='w-full py-3 mt-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2'>
							<FiCheckCircle />
							{dict.auth.understood}
						</motion.button>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
};

export default memo(EmailVerificationModal);
