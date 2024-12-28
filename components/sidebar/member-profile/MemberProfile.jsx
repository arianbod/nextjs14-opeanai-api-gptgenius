// components/MemberProfile.jsx
import React, { useState, useEffect, memo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from '@/context/TranslationContext';
import { FiLogOut, FiCopy, FiEye, FiEyeOff } from 'react-icons/fi';
import { IoMdRefresh } from 'react-icons/io';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ShowTokenAmount from '@/components/token/ShowTokenAmount';
import Link from 'next/link';
import Modal from '@/components/Modal'; // Ensure you have a Modal component

const MemberProfile = () => {
	const { user, logout } = useAuth();
	const { dict } = useTranslations();
	const [isTokenVisible, setIsTokenVisible] = useState(false);
	const [showPromo, setShowPromo] = useState(false);

	// Persist token visibility state
	useEffect(() => {
		const storedVisibility = localStorage.getItem('isTokenVisible');
		if (storedVisibility) {
			setIsTokenVisible(JSON.parse(storedVisibility));
		}
	}, []);

	useEffect(() => {
		localStorage.setItem('isTokenVisible', JSON.stringify(isTokenVisible));
	}, [isTokenVisible]);

	// Handle Black Friday Promotion Modal
	useEffect(() => {
		const promoShown = localStorage.getItem('blackFridayPromoShown');
		const currentDate = new Date();
		const promoStart = new Date('2024-11-27');
		const promoEnd = new Date('2024-12-05');

		if (!promoShown && currentDate >= promoStart && currentDate <= promoEnd) {
			setShowPromo(true);
		}
	}, []);

	const handleClosePromo = () => {
		setShowPromo(false);
		localStorage.setItem('blackFridayPromoShown', 'true');
	};

	if (!user) return null;

	const copyToken = () => {
		navigator.clipboard
			.writeText(user.token)
			.then(() => {
				toast.success(dict.auth.tokenCopied || 'Token copied!');
			})
			.catch(() => {
				toast.error(dict.auth.tokenCopyFailed || 'Failed to copy token.');
			});
	};

	const maskToken = (token) =>
		token ? `${token.slice(0, 6)}...${token.slice(-4)}` : '';

	// Function to get user initials
	const getUserInitials = (name) => {
		if (!name) return 'U';
		const names = name.split(' ');
		const initials = names.map((n) => n[0].toUpperCase());
		return initials.slice(0, 2).join('');
	};

	return (
		<>
			<div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full transition-transform '>
				{/* User Information and Login Token */}
				<div className='flex flex-col items-center justify-between'>
					<div className='flex items-center space-x-4'>
						{/* User Avatar - Hidden when token is visible */}
						{!isTokenVisible && (
							<Link href={`/account/${user.userId}`}>
								<motion.div
									className='w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center'
									whileHover={{ scale: 1.1 }}
									transition={{ duration: 0.3 }}>
									<span className='text-blue-600 dark:text-blue-300 font-semibold text-lg'>
										{getUserInitials(user.name)}
									</span>
								</motion.div>
							</Link>
						)}

						{/* User Info */}
						<div className='flex-1'>
							<div className='flex items-center space-x-2 flex-wrap'>
								<motion.span
									className='text-sm font-medium text-gray-800 dark:text-gray-200 break-all'
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5 }}>
									{isTokenVisible ? user.token : maskToken(user.token)}
								</motion.span>
								<div className='flex space-x-1'>
									<button
										onClick={() => setIsTokenVisible(!isTokenVisible)}
										className='text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition'
										aria-label={isTokenVisible ? 'Hide token' : 'Show token'}>
										{isTokenVisible ? (
											<FiEyeOff size={18} />
										) : (
											<FiEye size={18} />
										)}
									</button>
									<button
										onClick={copyToken}
										className='text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition'
										aria-label='Copy token'>
										<FiCopy size={18} />
									</button>
								</div>
							</div>
							<p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
								{dict.auth.OTPDescription ||
									'Please copy and save your token securely. You will need it for future logins.'}
							</p>
						</div>
					</div>

					{/* Logout Button */}
					<button
						onClick={logout}
						className='flex items-center gap-2 text-red-600 dark:text-red-200 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 px-3 py-2 rounded-full transition-colors'
						aria-label='Logout'
						title='Logout from your account'>
						<FiLogOut size={20} />
						<span className='text-sm font-medium'>Logout</span>
					</button>
				</div>

				{/* Divider */}
				<div className='my-6 border-t border-gray-200 dark:border-gray-700'></div>

				{/* Token Balance and Recharge */}
				<div className='flex items-center justify-between flex-wrap'>
					{/* Token Balance */}
					<ShowTokenAmount />

					{/* Recharge Button with Promotion */}
					<motion.div
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						transition={{ type: 'spring', stiffness: 300 }}>
						<Link
							href='/token/'
							className='flex items-center space-x-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-4 py-2 rounded-full shadow-lg transition transform'
							aria-label='Recharge Tokens'>
							<IoMdRefresh size={20} />
							<span className='text-sm font-semibold'>Recharge Now</span>
							<motion.span
								className='bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full'
								animate={{ scale: [1, 1.2, 1] }}
								transition={{ repeat: Infinity, duration: 1.5 }}>
								50% OFF
							</motion.span>
						</Link>
					</motion.div>
				</div>

				{/* Additional Guidance */}
				{/* <div className='mt-6'>
					<p className='text-xs text-gray-500 dark:text-gray-400'>
						{dict.auth.tokenReminder ||
							'Remember your token for your next login.'}
					</p>
				</div> */}
			</div>

			{/* Black Friday Promotion Modal */}
			{showPromo && (
				<Modal onClose={handleClosePromo}>
					<motion.div
						className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center'
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.8, opacity: 0 }}
						transition={{ duration: 0.3 }}>
						{/* Animated Banner */}
						<motion.div
							className='mb-4 mx-auto w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center'
							animate={{ rotate: 360 }}
							transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}>
							<span className='text-white font-bold text-xl'>🎉</span>
						</motion.div>

						<h2 className='text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200'>
							Black Friday Special!
						</h2>
						<p className='text-gray-600 dark:text-gray-300 mb-6'>
							Enjoy an exclusive{' '}
							<span className='font-bold text-green-500'>50% OFF</span> on all
							token recharges. Hurry, offer ends soon!
						</p>
						<motion.div
							className='flex justify-center'
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ duration: 0.5 }}>
							<Link
								href='/token/'
								className='flex items-center space-x-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-6 py-3 rounded-full shadow-lg transition transform'
								onClick={handleClosePromo}
								aria-label='Recharge Now with Black Friday Discount'>
								<IoMdRefresh size={20} />
								<span className='font-semibold'>Recharge Now</span>
							</Link>
						</motion.div>
					</motion.div>
				</Modal>
			)}
		</>
	);
};

export default memo(MemberProfile);
