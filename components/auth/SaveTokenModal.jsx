// components/auth/steps/SaveTokenModal.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const SaveTokenModal = ({
	token,
	animalSelection,
	hasSavedToken,
	setHasSavedToken,
	onClose,
	isNewUser,
	lang,
	dict,
}) => {
	const copyToken = () => {
		if (token) {
			navigator.clipboard
				.writeText(token)
				.then(() => toast.success(dict.auth.tokenCopied))
				.catch(() => toast.error(dict.auth.errors.copyFailed));
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
			<motion.div
				initial={{ scale: 0.9, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.9, opacity: 0 }}
				className='bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 relative'>
				<div className='space-y-6'>
					<div className='text-center'>
						<h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
							{dict.auth.saveToken}
						</h2>
						<p className='text-gray-500 dark:text-gray-400'>
							{dict.auth.tokenImportant}
						</p>
					</div>

					<div className='bg-gray-50 dark:bg-gray-700 rounded-xl p-4'>
						<div className='flex justify-between items-center mb-2'>
							<span className='text-sm text-gray-500 dark:text-gray-400'>
								{dict.auth.yourToken}
							</span>
							<button
								onClick={copyToken}
								className='text-blue-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20'>
								<FiCopy />
							</button>
						</div>
						<div className='font-mono text-sm break-all bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600'>
							{token}
						</div>
					</div>

					<div className='bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4'>
						<h3 className='font-semibold text-yellow-800 dark:text-yellow-200 mb-2'>
							{dict.auth.rememberAnimalOrder}
						</h3>
						<div className='flex gap-2 flex-wrap justify-center'>
							{animalSelection.map((animal, index) => (
								<div
									key={index}
									className='px-3 py-1 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center gap-1'>
									<span className='font-medium'>{index + 1}.</span>
									<span>{animal.emoji}</span>
								</div>
							))}
						</div>
					</div>

					<div className='flex items-center gap-2'>
						<input
							type='checkbox'
							id='tokenSaved'
							checked={hasSavedToken}
							onChange={(e) => setHasSavedToken(e.target.checked)}
							className='w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
						/>
						<label
							htmlFor='tokenSaved'
							className='text-sm text-gray-600 dark:text-gray-300'>
							{dict.auth.confirmTokenSaved}
						</label>
					</div>

					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						onClick={onClose}
						disabled={!hasSavedToken}
						className={`w-full py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 ${
							hasSavedToken
								? 'bg-blue-500 hover:bg-blue-600'
								: 'bg-gray-400 cursor-not-allowed'
						}`}>
						<FiCheckCircle />
						{dict.auth.continue}
					</motion.button>
				</div>
			</motion.div>
		</motion.div>
	);
};
export default SaveTokenModal;
