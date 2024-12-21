'use client';
import React, { useState } from 'react';
import {
	FaEnvelope,
	FaKey,
	FaCopy,
	FaTimes,
	FaCheckCircle,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from '@/context/TranslationContext';
import ThemeToggle from '../sidebar/ThemeToggle';
import LanguageToggle from '../sidebar/LanguageToggle';
import { useRouter } from 'next/navigation';

// Helper function to map animal keys to emojis
const getAnimalEmoji = (animalKey) => {
	const animalMap = {
		dog: '🐶',
		cat: '🐱',
		elephant: '🐘',
		lion: '🦁',
		tiger: '🐯',
		bear: '🐻',
		monkey: '🐵',
		giraffe: '🦒',
		zebra: '🦓',
		penguin: '🐧',
		kangaroo: '🦘',
		koala: '🐨',
	};
	return animalMap[animalKey] || '🐾';
};

const EmailVerificationModal = ({ email, onClose }) => {
	const dict = useTranslations();

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
			<div className='bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4'>
				<h2 className='text-xl font-bold mb-4 text-gray-900 dark:text-white'>
					{dict.auth.verifyEmail}
				</h2>
				<div className='bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4'>
					<p className='text-sm text-blue-800 dark:text-blue-200'>
						{dict.auth.verificationSent.replace('{email}', email)}
					</p>
				</div>
				<button
					onClick={onClose}
					className='w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center'>
					<FaCheckCircle className='mr-2' />
					{dict.auth.understood}
				</button>
			</div>
		</div>
	);
};

const SaveTokenModal = ({
	token,
	animalSelection,
	hasSavedToken,
	setHasSavedToken,
	onClose,
	isNewUser,
	lang,
}) => {
	const dict = useTranslations();
	const router = useRouter();

	const copyToken = () => {
		navigator.clipboard.writeText(token);
		toast.success(dict.auth.tokenCopied);
	};

	const handleContinue = () => {
		if (hasSavedToken) {
			onClose();
			if (isNewUser) {
				router.push(`/${lang}/welcome`);
			} else {
				router.push(`/${lang}/chat`);
			}
		}
	};

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
			<div className='bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4'>
				<h2 className='text-xl font-bold mb-4 text-gray-900 dark:text-white'>
					{dict.auth.saveToken}
				</h2>
				<div className='flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded'>
					<code className='flex-1 break-all'>{token}</code>
					<button
						onClick={copyToken}
						className='p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded'
						aria-label={dict.auth.saveToken}>
						<FaCopy />
					</button>
				</div>

				<div className='mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded text-yellow-800 dark:text-yellow-200'>
					<div className='mt-2 flex gap-2 flex-wrap justify-center'>
						{animalSelection.map((animal, index) => (
							<div
								key={index}
								className='px-2 py-1 bg-yellow-100 dark:bg-yellow-800 rounded flex items-center gap-1'>
								<span className='font-medium'>{index + 1}.</span>
								<span>{getAnimalEmoji(animal)}</span>
							</div>
						))}
					</div>
				</div>

				<div className='mt-4 flex items-center gap-2'>
					<input
						type='checkbox'
						id='savedTokenCheck'
						checked={hasSavedToken}
						onChange={() => setHasSavedToken(!hasSavedToken)}
						className='w-4 h-4'
					/>
					<label htmlFor='savedTokenCheck'>{dict.auth.confirmTokenSaved}</label>
				</div>

				<button
					onClick={handleContinue}
					disabled={!hasSavedToken}
					className={`w-full mt-4 py-2 rounded font-medium flex items-center justify-center ${
						hasSavedToken
							? 'bg-blue-500 hover:bg-blue-600 text-white'
							: 'bg-gray-300 text-gray-500 cursor-not-allowed'
					}`}>
					{dict.auth.continue}
				</button>
			</div>
		</div>
	);
};

const AuthPage = () => {
	const router = useRouter();
	const dict = useTranslations();
	const { login, register, verifyEmail } = useAuth();
	const [isRegistering, setIsRegistering] = useState(true);
	const [email, setEmail] = useState('');
	const [token, setToken] = useState('');
	const [selectedAnimals, setSelectedAnimals] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showEmailVerification, setShowEmailVerification] = useState(false);
	const [showTokenModal, setShowTokenModal] = useState(false);
	const [tokenModalData, setTokenModalData] = useState(null);
	const [hasSavedToken, setHasSavedToken] = useState(false);

	const handleAnimalSelect = (animal) => {
		if (selectedAnimals.includes(animal)) {
			const index = selectedAnimals.indexOf(animal);
			setSelectedAnimals((prev) => prev.slice(0, index));
		} else if (selectedAnimals.length < 3) {
			setSelectedAnimals((prev) => [...prev, animal]);
		}
	};

	const removeAnimalAtIndex = (index) => {
		setSelectedAnimals((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (selectedAnimals.length !== 3) {
			toast.error(dict.auth.errors.animals.selectThree);
			return;
		}

		setIsSubmitting(true);
		try {
			if (isRegistering) {
				const result = await register(email || null, selectedAnimals);

				if (!result.success) {
					if (result.validationErrors?.email?.length > 0) {
						toast.error(result.validationErrors.email[0]);
						return;
					}

					if (result.validationErrors?.animalSelection?.length > 0) {
						toast.error(result.validationErrors.animalSelection[0]);
						return;
					}

					toast.error(result.error || dict.auth.errors.register.generic);
					return;
				}

				// Show email verification modal if email was provided
				if (email && result.requiresEmailVerification) {
					setShowEmailVerification(true);
				}

				// Show token modal
				setTokenModalData({
					token: result.token,
					isNewUser: result.isNewUser,
					lang: result.lang,
				});
				setShowTokenModal(true);
			} else {
				if (!token.trim()) {
					toast.error(dict.auth.errors.login.tokenRequired);
					return;
				}

				const result = await login(token, selectedAnimals);

				if (result.success) {
					toast.success(dict.auth.login.successMessage);

					if (result.token !== token) {
						setTokenModalData({
							token: result.token,
							isNewUser: result.isNewUser,
							lang: result.lang,
						});
						setShowTokenModal(true);
					} else {
						if (result.isNewUser) {
							router.push(`/${result.lang}/welcome`);
						} else {
							router.push(`/${result.lang}/chat`);
						}
					}

					// Show email verification reminder if needed
					if (result.requiresEmailVerification) {
						toast.info(dict.auth.verificationReminder);
					}
				} else {
					if (result.accountStatus) {
						toast.error(
							`${result.accountStatus.status}: ${result.accountStatus.reason}`
						);
					} else if (result.isLocked) {
						toast.error(
							dict.auth.errors.login.accountLocked.replace(
								'${minutes}',
								result.remainingLockoutTime
							)
						);
					} else {
						toast.error(result.error || dict.auth.errors.login.generic);
					}
				}
			}
		} catch (error) {
			if (!navigator.onLine) {
				toast.error(dict.auth.errors.network);
			} else {
				toast.error(dict.auth.errors.generic);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='w-full max-w-4xl flex place-items-center place-content-center mx-auto min-h-screen p-4 '>
			<div className='w-full flex place-items-center place-content-center flex-col'>
				<div className='w-full rounded-lg p-6 mx-auto flex place-items-center place-content-center flex-col'>
					<div className='w-full flex justify-center items-center mb-6'>
						<h1 className='text-2xl font-bold text-gray-900 dark:text-white text-center'>
							{isRegistering ? dict.auth.register.title : dict.auth.login.title}
						</h1>
						<div className='flex gap-2 place-items-center'>
							<ThemeToggle />
							<LanguageToggle />
						</div>
					</div>

					<form
						onSubmit={handleSubmit}
						className='space-y-6'>
						{isRegistering && (
							<div>
								<label className='block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200'>
									{dict.auth.register.email}
									<span className='text-gray-500 text-xs ml-1'>
										({dict.auth.optional})
									</span>
								</label>
								<div className='relative'>
									<FaEnvelope className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
									<input
										type='email'
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className='w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
										placeholder={dict.auth.register.emailPlaceholder}
									/>
								</div>
							</div>
						)}

						{!isRegistering && (
							<div>
								<label className='block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200'>
									{dict.auth.login.token}
									<span className='text-red-500 ml-1'>*</span>
								</label>
								<div className='relative'>
									<FaKey className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
									<input
										type='text'
										value={token}
										onChange={(e) => setToken(e.target.value)}
										className='w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
										placeholder={dict.auth.login.tokenPlaceholder}
										required
									/>
								</div>
							</div>
						)}

						<div className='space-y-2'>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-200'>
								{dict.auth.selectedAnimalsOrder}
								<span className='text-red-500 ml-1'>*</span>
							</label>
							<div className='flex flex-wrap gap-2 min-h-[2.5rem] justify-center'>
								{selectedAnimals.map((animal, index) => (
									<div
										key={index}
										className='flex items-center gap-1 px-3 py-2 bg-blue-100 dark:bg-blue-900 rounded-full'>
										<span className='font-medium'>{index + 1}.</span>
										<span className='text-xl'>{getAnimalEmoji(animal)}</span>
										<button
											type='button'
											onClick={() => removeAnimalAtIndex(index)}
											className='ml-1 p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full'
											aria-label='Remove selected animal'>
											<FaTimes className='w-3 h-3 text-gray-600 dark:text-gray-300' />
										</button>
									</div>
								))}
							</div>
							<div className='grid grid-cols-3 gap-3'>
								{dict.auth.animalList.map((animal) => (
									<button
										key={animal.key}
										type='button'
										onClick={() => handleAnimalSelect(animal.key)}
										disabled={
											selectedAnimals.length >= 3 &&
											!selectedAnimals.includes(animal.key)
										}
										aria-label={animal.label}
										className={`w-16 h-16 flex items-center justify-center text-2xl rounded-lg transition-colors 
											${
												selectedAnimals.includes(animal.key)
													? 'bg-blue-500 text-white'
													: selectedAnimals.length >= 3
													? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
													: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
											}`}>
										{getAnimalEmoji(animal.key)}
									</button>
								))}
							</div>
						</div>

						<button
							type='submit'
							disabled={isSubmitting}
							className={`w-full py-3 rounded-lg text-white font-medium flex items-center justify-center transition-colors ${
								isSubmitting ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
							}`}>
							{isSubmitting ? (
								<span className='flex items-center justify-center'>
									{isRegistering
										? dict.auth.register.submitting
										: dict.auth.login.submitting}
								</span>
							) : isRegistering ? (
								dict.auth.register.submit
							) : (
								dict.auth.login.submit
							)}
						</button>
						<button
							type='button'
							onClick={() => {
								setIsRegistering(!isRegistering);
								setSelectedAnimals([]);
								setEmail('');
								setToken('');
							}}
							className='w-full py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center'>
							{isRegistering
								? dict.auth.register.switchToLogin
								: dict.auth.login.switchToRegister}
						</button>
					</form>
				</div>
			</div>

			{showEmailVerification && (
				<EmailVerificationModal
					email={email}
					onClose={() => setShowEmailVerification(false)}
				/>
			)}

			{showTokenModal && tokenModalData && (
				<SaveTokenModal
					token={tokenModalData.token}
					animalSelection={selectedAnimals}
					hasSavedToken={hasSavedToken}
					setHasSavedToken={setHasSavedToken}
					onClose={() => setShowTokenModal(false)}
					isNewUser={tokenModalData.isNewUser}
					lang={tokenModalData.lang}
				/>
			)}
		</div>
	);
};

export default AuthPage;
