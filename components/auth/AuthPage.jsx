'use client';
import React, { useState } from 'react';
import {
	FaEnvelope,
	FaPaw,
	FaLock,
	FaInfoCircle,
	FaCopy,
	FaTimes,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '../sidebar/ThemeToggle';
import { useTranslations } from '@/context/TranslationContext';
import LanguageToggle from '../sidebar/LanguageToggle';
import { useRouter } from 'next/navigation';

const AuthPage = () => {
	const router = useRouter();
	const dict = useTranslations();
	const { login, register } = useAuth();
	const [isRegistering, setIsRegistering] = useState(true);
	const [email, setEmail] = useState('');
	const [token, setToken] = useState('');
	const [selectedAnimals, setSelectedAnimals] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [registrationToken, setRegistrationToken] = useState('');
	const [showTokenModal, setShowTokenModal] = useState(false);

	const handleAnimalSelect = (animal) => {
		if (selectedAnimals.includes(animal)) {
			// Remove this animal and all animals after it in the sequence
			const index = selectedAnimals.indexOf(animal);
			setSelectedAnimals((prev) => prev.slice(0, index));
		} else if (selectedAnimals.length < 3) {
			// Add the animal to the sequence
			setSelectedAnimals((prev) => [...prev, animal]);
		}
	};

	const removeAnimalAtIndex = (index) => {
		setSelectedAnimals((prev) => prev.slice(0, index));
	};

	const copyToken = () => {
		navigator.clipboard.writeText(registrationToken);
		toast.success(dict.auth.tokenCopied);
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

				// First check if there's a validation error response
				if (!result.success) {
					// Check for email-specific errors in the validation details
					if (
						result.details?.some((error) =>
							error.includes('Email is already registered')
						)
					) {
						toast.error(dict.auth.errors.register.emailTaken);
						return;
					}

					// Handle other validation errors
					if (result.validationErrors?.email?.length > 0) {
						toast.error(result.validationErrors.email[0]);
						return;
					}

					if (result.validationErrors?.animalSelection?.length > 0) {
						toast.error(result.validationErrors.animalSelection[0]);
						return;
					}

					// If no specific error was found, show the generic error
					toast.error(result.error || dict.auth.errors.register.generic);
					return;
				}

				// Handle success case
				setRegistrationToken(result.token);
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
						setRegistrationToken(result.token);
						setShowTokenModal(true);
					}
					router.push('/chat');
				} else {
					// Handle different types of login errors
					if (!token.trim()) {
						toast.error(dict.auth.errors.login.tokenRequired);
					} else if (result.message?.includes('Invalid authentication token')) {
						toast.error(dict.auth.errors.login.invalidToken);
					} else if (result.isLocked) {
						toast.error(
							dict.auth.errors.login.accountLocked.replace(
								'${minutes}',
								result.remainingLockoutTime
							)
						);
					} else if (result.remainingAttempts !== undefined) {
						toast.error(
							dict.auth.errors.login.incorrectSequence.replace(
								'${attempts}',
								result.remainingAttempts
							)
						);
					} else {
						toast.error(result.error || dict.auth.errors.login.generic);
					}
				}
			}
		} catch (error) {
			// Handle network or unexpected errors
			if (!navigator.onLine) {
				toast.error(dict.auth.errors.network);
			} else {
				toast.error(dict.auth.errors.generic);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	// Token Modal Component
	const TokenModal = () => (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
			<div className='bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4'>
				<h2 className='text-xl font-bold mb-4'>{dict.auth.saveToken}</h2>
				<p className='mb-4 text-sm'>{dict.auth.tokenImportant}</p>
				<div className='flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded'>
					<code className='flex-1 break-all'>{registrationToken}</code>
					<button
						onClick={copyToken}
						className='p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded'>
						<FaCopy />
					</button>
				</div>
				<div className='mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded'>
					<p className='text-sm text-yellow-800 dark:text-yellow-200'>
						{dict.auth.rememberAnimalOrder}
						<div className='mt-2 flex gap-2'>
							{selectedAnimals.map((animal, index) => (
								<div
									key={index}
									className='px-2 py-1 bg-yellow-100 dark:bg-yellow-800 rounded'>
									{index + 1}.{' '}
									{dict.auth.animalList.find((a) => a.key === animal)?.label}
								</div>
							))}
						</div>
					</p>
				</div>
				<button
					onClick={() => {
						setShowTokenModal(false);
						if (isRegistering) router.push('/chat');
					}}
					className='w-full mt-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'>
					{dict.auth.understood}
				</button>
			</div>
		</div>
	);

	return (
		<div className='flex items-center justify-center min-h-screen lg:p-4 lg:fixed left-0 right-0 mx-auto h-fit overflow-auto'>
			<div className='w-full max-w-md'>
				<div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl'>
					{/* Header section with toggles */}
					<div className='relative p-6 flex justify-between items-center'>
						<h1 className='text-xl lg:text-2xl font-bold text-center mx-auto'>
							{isRegistering ? dict.auth.register.title : dict.auth.login.title}
						</h1>
						<div className='absolute right-2 flex gap-2 place-items-center'>
							<ThemeToggle />
							<LanguageToggle />
						</div>
					</div>

					{/* Info Card */}
					<div className='mx-6 mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
						<div className='flex items-start gap-2'>
							<FaInfoCircle className='text-blue-500 mt-1 flex-shrink-0' />
							<div className='text-sm text-blue-800 dark:text-blue-200'>
								<p>
									{isRegistering
										? dict.auth.register.info
										: dict.auth.login.info}
								</p>
								<p className='mt-2 font-medium'>{dict.auth.orderMatters}</p>
							</div>
						</div>
					</div>

					<form
						onSubmit={handleSubmit}
						className='p-6 space-y-6'>
						{/* Email/Token Input */}
						{isRegistering ? (
							<div className='relative'>
								<label className='block text-sm font-medium mb-1'>
									{dict.auth.register.email}
									<span className='text-red-500 ml-1'>*</span>
								</label>
								<input
									type='email'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 ${
										email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
											? 'border-red-500 focus:ring-red-200'
											: 'focus:ring-blue-200'
									}`}
									placeholder={dict.auth.register.emailPlaceholder}
									required
								/>
								<FaEnvelope className='absolute left-3 top-9 text-gray-400' />
								{email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) && (
									<p className='mt-1 text-sm text-red-500'>
										{dict.auth.errors.email.invalid}
									</p>
								)}
							</div>
						) : (
							<div className='relative'>
								<label className='block text-sm font-medium mb-1'>
									{dict.auth.login.token}
									<span className='text-red-500 ml-1'>*</span>
								</label>
								<input
									type='text'
									value={token}
									onChange={(e) => setToken(e.target.value)}
									className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 ${
										token.trim() === '' ? 'border-red-500' : ''
									}`}
									required
									placeholder={dict.auth.login.tokenPlaceholder}
								/>
								<FaLock
									className={`absolute left-3 top-9 ${
										token.trim() === '' ? 'text-red-400' : 'text-gray-400'
									}`}
								/>
								{token.trim() === '' && (
									<p className='mt-1 text-sm text-red-500'>
										{dict.auth.errors.login.tokenRequired}
									</p>
								)}
							</div>
						)}

						{/* Selected Animals Display */}
						<div className='space-y-2'>
							<label className='block text-sm font-medium'>
								{dict.auth.selectedAnimalsOrder}
							</label>
							<div className='flex gap-2 min-h-[2.5rem]'>
								{selectedAnimals.map((animal, index) => (
									<div
										key={index}
										className='flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded'>
										<span className='font-medium'>{index + 1}.</span>
										<span>
											{
												dict.auth.animalList.find((a) => a.key === animal)
													?.label
											}
										</span>
										<button
											type='button'
											onClick={() => removeAnimalAtIndex(index)}
											className='ml-1 p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full'>
											<FaTimes className='w-3 h-3' />
										</button>
									</div>
								))}
								{selectedAnimals.length < 3 && (
									<div className='text-sm text-gray-500 flex items-center'>
										{dict.auth.selectNext}
									</div>
								)}
							</div>
						</div>

						{/* Animal Selection Grid */}
						<div>
							<label className='block text-sm font-medium mb-2'>
								{dict.auth.selectAnimalsInOrder}
								<span className='text-sm text-gray-500 ml-2'>
									({selectedAnimals.length}/3)
								</span>
							</label>
							<div className='grid grid-cols-3 gap-2'>
								{dict.auth.animalList.map((animal) => (
									<button
										key={animal.key}
										type='button'
										onClick={() => handleAnimalSelect(animal.key)}
										disabled={
											selectedAnimals.length >= 3 &&
											!selectedAnimals.includes(animal.key)
										}
										className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
											selectedAnimals.includes(animal.key)
												? 'bg-blue-500 text-white'
												: selectedAnimals.length >= 3
												? 'bg-gray-100 text-gray-400 cursor-not-allowed'
												: 'bg-gray-100 hover:bg-gray-200 text-gray-800'
										}`}>
										<FaPaw className='mr-1' />
										{animal.label}
									</button>
								))}
							</div>
						</div>

						{/* Submit Button */}
						<button
							type='submit'
							disabled={isSubmitting}
							className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
								isSubmitting
									? 'bg-gray-400'
									: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
							}`}>
							{isSubmitting ? (
								<span className='flex items-center justify-center'>
									<svg
										className='animate-spin h-5 w-5 mr-3'
										viewBox='0 0 24 24'>
										<circle
											className='opacity-25'
											cx='12'
											cy='12'
											r='10'
											stroke='currentColor'
											strokeWidth='4'
											fill='none'
										/>
										<path
											className='opacity-75'
											fill='currentColor'
											d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
										/>
									</svg>
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
					</form>

					{/* Toggle Registration/Login */}
					<div className='px-6 pb-6'>
						<button
							onClick={() => {
								setIsRegistering(!isRegistering);
								setSelectedAnimals([]);
							}}
							className='w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'>
							{isRegistering
								? dict.auth.register.switchToLogin
								: dict.auth.login.switchToRegister}
						</button>
					</div>
				</div>
			</div>

			{/* Token Modal */}
			{showTokenModal && <TokenModal />}
		</div>
	);
};

export default AuthPage;
