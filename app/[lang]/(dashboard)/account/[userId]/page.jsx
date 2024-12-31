'use client';
import React, { useState } from 'react';
import {
	FaUser,
	FaEnvelope,
	FaKey,
	FaCopy,
	FaShieldAlt,
	FaCoins,
	FaCheckCircle,
	FaTimesCircle,
	FaSync,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from '@/context/TranslationContext';

const EmailSection = ({ isRTL, dict }) => {
	const [isUpdating, setIsUpdating] = useState(false);
	const [newEmail, setNewEmail] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { user, isEmailVerified, updateEmail, resendVerificationEmail } =
		useAuth();

	const handleUpdateEmail = async (e) => {
		e.preventDefault();
		if (!newEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
			toast.error(dict.account.invalidEmail);
			return;
		}

		setIsSubmitting(true);
		try {
			const result = await updateEmail(newEmail);
			if (result.success) {
				toast.success(result.message);
				setIsUpdating(false);
			} else {
				toast.error(result.error || dict.account.updateFailed);
			}
		} catch (error) {
			toast.error(dict.account.updateFailed);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleResendVerification = async () => {
		try {
			const result = await resendVerificationEmail();
			if (result.success) {
				toast.success(result.message);
			} else {
				toast.error(result.error || 'Failed to resend verification email');
			}
		} catch (error) {
			toast.error('Failed to resend verification email');
		}
	};

	return (
		<div className='space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
			<div
				className={`flex items-center justify-between ${
					isRTL ? 'flex-row-reverse' : 'flex-row'
				}`}>
				<div
					className={`flex items-center gap-2 ${
						isRTL ? 'flex-row-reverse' : 'flex-row'
					}`}>
					<FaEnvelope className='text-gray-400' />
					<span className='text-sm font-medium'>{dict.account.email}</span>
				</div>
				<div
					className={`flex items-center gap-2 ${
						isRTL ? 'flex-row-reverse' : 'flex-row'
					}`}>
					{user?.email && (
						<span
							className={`text-sm px-2 py-1 rounded-full flex items-center gap-1 
                            ${
															isEmailVerified
																? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
																: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
														}`}>
							{isEmailVerified ? (
								<>
									<FaCheckCircle size={12} /> {dict.account.verified}
								</>
							) : (
								<>
									<FaTimesCircle size={12} /> {dict.account.unverified}
								</>
							)}
						</span>
					)}
					{(!isEmailVerified || !user?.email) && !isUpdating && (
						<button
							onClick={() => setIsUpdating(true)}
							className='text-sm text-blue-500 hover:text-blue-600'>
							{user?.email ? dict.account.updateEmail : dict.account.addEmail}
						</button>
					)}
				</div>
			</div>

			{user?.email && !isEmailVerified && !isUpdating && (
				<div
					className={`flex items-center justify-between bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded ${
						isRTL ? 'flex-row-reverse' : 'flex-row'
					}`}>
					<span className='text-sm text-yellow-800 dark:text-yellow-200'>
						{dict.account.verificationPending}
					</span>
					<button
						onClick={handleResendVerification}
						className='text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1'>
						<FaSync className='w-4 h-4' />
						{dict.account.resendVerification}
					</button>
				</div>
			)}

			{isUpdating && (
				<form
					onSubmit={handleUpdateEmail}
					className='space-y-2'>
					<input
						type='email'
						value={newEmail}
						onChange={(e) => setNewEmail(e.target.value)}
						placeholder={dict.account.newEmailPlaceholder}
						className='w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600'
						disabled={isSubmitting}
					/>
					<div
						className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
						<button
							type='submit'
							disabled={isSubmitting}
							className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300'>
							{isSubmitting ? dict.account.updating : dict.account.save}
						</button>
						<button
							type='button'
							onClick={() => setIsUpdating(false)}
							className='px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200'>
							{dict.account.cancel}
						</button>
					</div>
				</form>
			)}

			{user?.email && (
				<p className='text-gray-600 dark:text-gray-300'>{user.email}</p>
			)}
		</div>
	);
};

const AccountPage = () => {
	const { user, tokenBalance, logout } = useAuth();
	const { dict, isRTL } = useTranslations();
	const [showToken, setShowToken] = useState(false);

	const copyToken = () => {
		if (user?.token) {
			navigator.clipboard.writeText(user.token);
			toast.success(dict.account.tokenCopied);
		}
	};

	return (
		<div
			className={`min-h-screen py-8 ${
				isRTL ? 'text-right' : 'text-left'
			} bg-gray-50 dark:bg-gray-900`}
			dir={isRTL ? 'rtl' : 'ltr'}>
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
						<div className='space-y-4'>
							<h2 className='text-lg font-semibold flex items-center gap-2'>
								<FaUser className='text-blue-500' />
								{dict.account.userInfo}
							</h2>

							<EmailSection
								isRTL={isRTL}
								dict={dict}
							/>

							{/* Token Balance */}
							<div className='p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
								<div
									className={`flex items-center justify-between ${
										isRTL ? 'flex-row-reverse' : 'flex-row'
									}`}>
									<div
										className={`flex items-center gap-2 ${
											isRTL ? 'flex-row-reverse' : 'flex-row'
										}`}>
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
								<div
									className={`flex items-center justify-between mb-2 ${
										isRTL ? 'flex-row-reverse' : 'flex-row'
									}`}>
									<div
										className={`flex items-center gap-2 ${
											isRTL ? 'flex-row-reverse' : 'flex-row'
										}`}>
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
									<div className='bg-gray-100 dark:bg-gray-600 p-2 rounded break-all  text-sm'>
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
								<div
									className={`flex items-center gap-2 mb-2 ${
										isRTL ? 'flex-row-reverse' : 'flex-row'
									}`}>
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
