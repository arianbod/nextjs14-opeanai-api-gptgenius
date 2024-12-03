'use client';
import React, { useState } from 'react';
import {
	FaUser,
	FaEnvelope,
	FaKey,
	FaCopy,
	FaHistory,
	FaShieldAlt,
	FaCoins,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from '@/context/TranslationContext';

const AccountPage = () => {
	const { user, tokenBalance, logout } = useAuth();
	const dict = useTranslations();
	const [showToken, setShowToken] = useState(false);
	const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
	const [newEmail, setNewEmail] = useState('');

	const copyToken = () => {
		if (user?.token) {
			navigator.clipboard.writeText(user.token);
			toast.success(dict.account.tokenCopied);
		}
	};

	const handleUpdateEmail = async (e) => {
		e.preventDefault();
		if (!newEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
			toast.error(dict.account.invalidEmail);
			return;
		}

		try {
			const response = await fetch('/api/user/update-email', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email: newEmail }),
			});

			const data = await response.json();

			if (response.ok) {
				toast.success(dict.account.emailUpdated);
				setIsUpdatingEmail(false);
			} else {
				toast.error(data.error || dict.account.updateFailed);
			}
		} catch (error) {
			toast.error(dict.account.updateFailed);
		}
	};

	return (
		<div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-8'>
			<div className='max-w-4xl mx-auto px-4'>
				<div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl'>
					{/* Header */}
					<div className='p-6 border-b border-gray-200 dark:border-gray-700'>
						<h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
							{dict.account.title}
						</h1>
						<p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
							{dict.account.subtitle}
						</p>
					</div>

					{/* Main Content */}
					<div className='p-6 space-y-6'>
						{/* User Info Section */}
						<div className='space-y-4'>
							<h2 className='text-lg font-semibold flex items-center gap-2'>
								<FaUser className='text-blue-500' />
								{dict.account.userInfo}
							</h2>

							{/* Email */}
							<div className='space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-2'>
										<FaEnvelope className='text-gray-400' />
										<span className='text-sm font-medium'>
											{dict.account.email}
										</span>
									</div>
									{!isUpdatingEmail && (
										<button
											onClick={() => setIsUpdatingEmail(true)}
											className='text-sm text-blue-500 hover:text-blue-600'>
											{dict.account.updateEmail}
										</button>
									)}
								</div>

								{isUpdatingEmail ? (
									<form
										onSubmit={handleUpdateEmail}
										className='space-y-2'>
										<input
											type='email'
											value={newEmail}
											onChange={(e) => setNewEmail(e.target.value)}
											placeholder={dict.account.newEmailPlaceholder}
											className='w-full p-2 border rounded'
										/>
										<div className='flex gap-2'>
											<button
												type='submit'
												className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'>
												{dict.account.save}
											</button>
											<button
												type='button'
												onClick={() => setIsUpdatingEmail(false)}
												className='px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300'>
												{dict.account.cancel}
											</button>
										</div>
									</form>
								) : (
									<p className='text-gray-600 dark:text-gray-300'>
										{user?.email || dict.account.noEmail}
									</p>
								)}
							</div>

							{/* Token Balance */}
							<div className='p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-2'>
										<FaCoins className='text-yellow-500' />
										<span className='text-sm font-medium'>
											{dict.account.tokenBalance}
										</span>
									</div>
									<span className='text-lg font-semibold'>{tokenBalance}</span>
								</div>
							</div>

							{/* Authentication Token */}
							<div className='p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
								<div className='flex items-center justify-between mb-2'>
									<div className='flex items-center gap-2'>
										<FaKey className='text-green-500' />
										<span className='text-sm font-medium'>
											{dict.account.authToken}
										</span>
									</div>
									<div className='flex gap-2'>
										<button
											onClick={() => setShowToken(!showToken)}
											className='text-sm text-blue-500 hover:text-blue-600'>
											{showToken
												? dict.account.hideToken
												: dict.account.showToken}
										</button>
										<button
											onClick={copyToken}
											className='text-sm text-blue-500 hover:text-blue-600'>
											<FaCopy />
										</button>
									</div>
								</div>
								{showToken ? (
									<div className='bg-gray-100 dark:bg-gray-600 p-2 rounded break-all font-mono text-sm'>
										{user?.token}
									</div>
								) : (
									<div className='bg-gray-100 dark:bg-gray-600 p-2 rounded'>
										••••••••••••••••
									</div>
								)}
							</div>

							{/* Security Info */}
							<div className='p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
								<div className='flex items-center gap-2 mb-2'>
									<FaShieldAlt className='text-red-500' />
									<span className='text-sm font-medium'>
										{dict.account.security}
									</span>
								</div>
								<p className='text-sm text-gray-600 dark:text-gray-300'>
									{dict.account.securityInfo}
								</p>
							</div>
						</div>

						{/* Actions */}
						<div className='pt-6 border-t border-gray-200 dark:border-gray-700'>
							<button
								onClick={logout}
								className='w-full py-2 bg-red-500 text-white rounded hover:bg-red-600'>
								{dict.account.logout}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AccountPage;
