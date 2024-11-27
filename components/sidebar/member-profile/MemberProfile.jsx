// components/MemberProfile.jsx
import React, { useState, useEffect, memo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from '@/context/TranslationContext';
import { FiLogOut, FiCopy, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ShowTokenAmount from '@/components/token/ShowTokenAmount';
import Link from 'next/link';
import { IoMdRefresh } from 'react-icons/io'; // Additional icon for recharge
import Modal from '@/components/Modal'; // Assuming you have a Modal component

const MemberProfile = () => {
	const { user, logout } = useAuth();
	const dict = useTranslations();
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
		const promoEnd = new Date('2024-12-27');

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
			<div className='bg-white dark:bg-gray-800 rounded-lg shadow-inner p-4 w-full'>
				{/* User Information and Login Token */}
				<div className='flex items-center justify-between'>
					<div className='flex items-center space-x-3'>
						{/* User Avatar - Hidden when token is visible */}
						{!isTokenVisible && (
							<div className='w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center'>
								<span className='text-blue-600 dark:text-blue-300 font-semibold text-lg'>
									{getUserInitials(user.name)}
								</span>
							</div>
						)}

						{/* User Info */}
						<div className='flex-1'>
							<div className='flex items-center space-x-2 flex-wrap'>
								<span className='text-sm font-medium text-gray-800 dark:text-gray-200 break-all'>
									{isTokenVisible ? user.token : maskToken(user.token)}
								</span>
								<div className='flex space-x-1'>
									<button
										onClick={() => setIsTokenVisible(!isTokenVisible)}
										className='text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition'
										aria-label={isTokenVisible ? 'Hide token' : 'Show token'}>
										{isTokenVisible ? (
											<FiEyeOff size={16} />
										) : (
											<FiEye size={16} />
										)}
									</button>
									<button
										onClick={copyToken}
										className='text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition'
										aria-label='Copy token'>
										<FiCopy size={16} />
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
						className='text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 p-2 rounded-full transition'
						aria-label='Logout'>
						<FiLogOut size={20} />
					</button>
				</div>

				{/* Divider */}
				<div className='my-4 border-t border-gray-200 dark:border-gray-700'></div>

				{/* Token Balance and Recharge */}
				<div className='flex items-center justify-between flex-wrap'>
					{/* Token Balance */}
					<ShowTokenAmount />

					{/* Recharge Button with Promotion */}
					<Link
						href='/token/recharge'
						className='flex items-center space-x-1 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-3 py-1 rounded-full transition mt-2 md:mt-0'
						aria-label='Recharge Tokens'>
						<IoMdRefresh size={18} />
						<span className='text-sm font-semibold'>Recharge</span>
						<span className='bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full'>
							50% OFF
						</span>
					</Link>
				</div>

				{/* Additional Guidance */}
				<div className='mt-4'>
					<p className='text-xs text-gray-500 dark:text-gray-400'>
						{dict.auth.tokenReminder ||
							'Remember your token for your next login.'}
					</p>
				</div>
			</div>

			{/* Black Friday Promotion Modal */}
			{showPromo && (
				<Modal onClose={handleClosePromo}>
					<h2 className='text-lg font-semibold mb-2'>Black Friday Special!</h2>
					<p className='mb-4'>
						Enjoy 50% off on all token recharges. Hurry, offer ends soon!
					</p>
					<Link
						href='/token/recharge'
						className='flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-4 py-2 rounded'
						onClick={handleClosePromo}>
						<IoMdRefresh size={18} />
						<span>Recharge Now</span>
					</Link>
				</Modal>
			)}
		</>
	);
};

export default memo(MemberProfile);
