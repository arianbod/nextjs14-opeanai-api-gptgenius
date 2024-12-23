'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from '@/context/TranslationContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import StepLayout from './steps/StepLayout';
import StepOne from './steps/StepOne';
import StepTwo from './steps/StepTwo';
import StepThree from './steps/StepThree';
import TokenConfirmation from './steps/TokenConfirmation';
import EmailVerificationModal from './EmailVerificationModal';
import SaveTokenModal from './SaveTokenModal';
import ThemeToggle from '../sidebar/ThemeToggle';
import LanguageToggle from '../sidebar/LanguageToggle';
import { serverLogger } from '@/server/logger';

// Helper Functions
const formatAnimalSelection = (animals) => {
	if (!Array.isArray(animals)) return [];
	if (animals.length > 0 && typeof animals[0] === 'object') return animals;
	return animals.map((key) => ({
		key,
		emoji: getAnimalEmoji(key),
		label: key,
	}));
};

const getAnimalKeys = (animals) => {
	if (!Array.isArray(animals)) return [];
	return animals.map((animal) =>
		typeof animal === 'object' ? animal.key : animal
	);
};

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

const loadInitialState = (key, defaultValue) => {
	if (typeof window === 'undefined') return defaultValue;
	try {
		const savedProgress = sessionStorage.getItem('authProgress');
		if (savedProgress) {
			const progress = JSON.parse(savedProgress);
			return progress[key] ?? defaultValue;
		}
	} catch (error) {
		console.error('Failed to load initial state:', error);
	}
	return defaultValue;
};

const AuthPage = () => {
	const router = useRouter();
	const dict = useTranslations();
	const { login, register } = useAuth();

	// Core authentication state
	const [currentStep, setCurrentStep] = useState(() =>
		loadInitialState('step', 0)
	);
	const [isRegistering, setIsRegistering] = useState(() =>
		loadInitialState('isRegistering', true)
	);
	const [email, setEmail] = useState(() => loadInitialState('email', ''));
	const [token, setToken] = useState('');
	const [selectedAnimals, setSelectedAnimals] = useState(() =>
		formatAnimalSelection(loadInitialState('selectedAnimals', []))
	);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Modal states
	const [showEmailVerification, setShowEmailVerification] = useState(false);
	const [showTokenModal, setShowTokenModal] = useState(false);
	const [tokenModalData, setTokenModalData] = useState(null);
	const [hasSavedToken, setHasSavedToken] = useState(false);

	// Validation state
	const [errors, setErrors] = useState({});

	// Update resetProgress function:
	const resetProgress = useCallback(() => {
		sessionStorage.removeItem('authProgress');
		setCurrentStep(0);
		setSelectedAnimals([]);
		setEmail('');
		setToken('');
		setErrors({});
	}, []);

	// Update the step saving effect:
	useEffect(() => {
		if (currentStep > 0) {
			const progressData = {
				step: currentStep,
				isRegistering,
				selectedAnimals: getAnimalKeys(selectedAnimals),
				email,
			};
			sessionStorage.setItem('authProgress', JSON.stringify(progressData));
		} else {
			// Clear progress when back at step 0
			sessionStorage.removeItem('authProgress');
		}
	}, [currentStep, isRegistering, selectedAnimals, email]);

	const sendToLogServer = async () => {
		await serverLogger('step state', currentStep);
	};
	useEffect(() => sendToLogServer, [currentStep]);
	// Registration handler
	const handleRegistration = async () => {
		console.log('Starting registration with:', { email, selectedAnimals });
		setIsSubmitting(true);
		setErrors({});

		try {
			// Convert animal objects to just their keys for the API
			const animalKeys = getAnimalKeys(selectedAnimals);

			// Validate animals
			if (animalKeys.length !== 3) {
				setErrors({ animals: dict.auth.errors.animals.selectThree });
				return;
			}

			// Validate email if provided
			if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
				setErrors({ email: dict.auth.errors.email.invalid });
				return;
			}

			// Call register only after validations pass
			const result = await register(email || null, animalKeys);
			console.log('Registration result:', result);

			if (!result.success) {
				handleRegistrationError(result);
				return;
			}

			// Move to token display only after successful registration
			setToken(result.token);
			setCurrentStep(3);

			if (email && result.requiresEmailVerification) {
				setShowEmailVerification(true);
			}
		} catch (error) {
			console.error('Registration error:', error);
			handleUnexpectedError();
		} finally {
			setIsSubmitting(false);
		}
	};
	// Add this component to handle mode switching
	const ModeSwitcher = ({ isRegistering, onSwitch }) => {
		return (
			<button
				onClick={() => onSwitch(!isRegistering)}
				className='text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 absolute top-4 left-4'>
				{isRegistering
					? dict.auth.login.switchToLogin
					: dict.auth.register.switchToRegister}
			</button>
		);
	};

	// Update AuthPage component to include mode switching:
	const handleModeSwitch = useCallback((newMode) => {
		setIsRegistering(newMode);
		resetProgress(); // Clear stored progress
		setCurrentStep(0);
		setSelectedAnimals([]);
		setEmail('');
		setToken('');
		setErrors({});
	}, []);

	// Update step navigation
	const handleStepThreeNext = useCallback(() => {
		if (isRegistering) {
			// For registration, now is the time to register
			handleRegistration();
		} else {
			// For login, just move to token input
			setCurrentStep(3);
		}
	}, [isRegistering, handleRegistration]);

	// Login handler
	const handleLogin = async () => {
		console.log('Starting login with:', {
			token: token.slice(0, 8) + '...',
			selectedAnimals,
		});
		setIsSubmitting(true);
		setErrors({});

		try {
			if (!token?.trim()) {
				setErrors({ token: dict.auth.errors.login.tokenRequired });
				return;
			}

			const animalKeys = getAnimalKeys(selectedAnimals);
			const result = await login(token, animalKeys);

			if (!result.success) {
				handleLoginError(result);
				return;
			}

			handleSuccessfulLogin(result);
		} catch (error) {
			console.error('Login error:', error);
			handleUnexpectedError();
		} finally {
			setIsSubmitting(false);
		}
	};

	// Error handlers
	// In AuthPage.jsx, update handleRegistrationError:
	const handleRegistrationError = useCallback(
		(result) => {
			console.log('Handling registration error:', result);
			if (result.code === 'DUPLICATE_EMAIL') {
				// Special handling for duplicate email
				toast(
					(t) => (
						<div className='flex flex-col gap-2'>
							<div>{dict.auth.errors.register.emailTaken}</div>
							<button
								onClick={() => {
									setIsRegistering(false);
									resetProgress(); // Reset the stored progress
									setCurrentStep(0);
									toast.dismiss(t.id);
								}}
								className='bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 text-sm'>
								{dict.auth.login.switchToLogin}
							</button>
						</div>
					),
					{ duration: 5000 }
				);
			} else if (result.validationErrors?.email?.length > 0) {
				setErrors({ email: result.validationErrors.email[0] });
			} else if (result.validationErrors?.animalSelection?.length > 0) {
				setErrors({ animals: result.validationErrors.animalSelection[0] });
			} else {
				toast.error(result.error || dict.auth.errors.register.generic);
			}
		},
		[dict.auth.errors, dict.auth.login.switchToLogin]
	);

	const handleLoginError = useCallback(
		(result) => {
			console.log('Handling login error:', result);
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
			} else if (result.remainingAttempts) {
				toast.error(
					dict.auth.errors.login.incorrectSequence.replace(
						'${attempts}',
						result.remainingAttempts
					)
				);
			} else {
				toast.error(result.error || dict.auth.errors.login.generic);
			}
		},
		[dict.auth.errors.login]
	);

	const handleSuccessfulLogin = useCallback(
		(result) => {
			console.log('Handling successful login:', { ...result, token: 'hidden' });

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

			if (result.requiresEmailVerification) {
				toast.info(dict.auth.verificationReminder);
			}
		},
		[dict.auth.verificationReminder, router, token]
	);

	const handleUnexpectedError = useCallback(() => {
		if (!navigator.onLine) {
			toast.error(dict.auth.errors.network);
		} else {
			toast.error(dict.auth.errors.generic);
		}
	}, [dict.auth.errors]);

	const handleBack = useCallback(() => {
		setErrors({});
		if (currentStep === 1) {
			setIsRegistering(true);
		} else if (currentStep === 2) {
			setSelectedAnimals([]);
		} else if (currentStep === 3) {
			if (isRegistering) {
				setEmail('');
			} else {
				setToken('');
			}
		}

		// Save the new state to session storage after step change
		const newStep = Math.max(0, currentStep - 1);
		setCurrentStep(newStep);
		if (newStep === 0) {
			sessionStorage.removeItem('authProgress');
		}
	}, [currentStep, isRegistering]);

	// Step content renderer
	const getCurrentStepContent = () => {
		switch (currentStep) {
			case 0:
				return (
					<StepOne
						isRegistering={isRegistering}
						onModeChange={setIsRegistering}
						onNext={() => setCurrentStep(1)}
						dict={dict}
					/>
				);
			case 1:
				return (
					<StepTwo
						selectedAnimals={selectedAnimals}
						onAnimalSelect={(animal) => {
							console.log('Animal selected:', animal);
							const formatted = { key: animal, emoji: getAnimalEmoji(animal) };
							if (selectedAnimals.find((a) => a.key === animal)) {
								setSelectedAnimals((prev) =>
									prev.filter((a) => a.key !== animal)
								);
							} else if (selectedAnimals.length < 3) {
								setSelectedAnimals((prev) => [...prev, formatted]);
							}
						}}
						onAnimalRemove={(index) => {
							console.log('Removing animal at index:', index);
							setSelectedAnimals((prev) => prev.filter((_, i) => i !== index));
						}}
						error={errors.animals}
						onNext={() => {
							if (selectedAnimals.length === 3) {
								setCurrentStep(isRegistering ? 2 : 3);
							} else {
								setErrors({ animals: dict.auth.errors.animals.selectThree });
							}
						}}
						dict={dict}
					/>
				);
			case 2:
				return isRegistering ? (
					<StepThree
						email={email}
						error={errors.email}
						onEmailChange={setEmail}
						onNext={handleStepThreeNext}
						isSubmitting={isSubmitting}
						dict={dict}
					/>
				) : null;
			case 3:
				return (
					<TokenConfirmation
						isLogin={!isRegistering}
						token={token}
						error={errors.token}
						onTokenInput={setToken}
						onComplete={isRegistering ? null : handleLogin}
						isSubmitting={isSubmitting}
						dict={dict}
						selectedAnimals={selectedAnimals}
						readOnly={isRegistering}
						hasEmail={!!email} // Add this line
					/>
				);
			default:
				return null;
		}
	};

	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'hidden') {
				sessionStorage.removeItem('authProgress');
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	}, []);
	return (
		<div className='relative min-h-screen w-full'>
			<StepLayout
				currentStep={currentStep}
				totalSteps={isRegistering ? 4 : 3}
				onBack={handleBack}
				showBackButton={currentStep > 0}>
				{/* Add mode switcher if not in final step */}
				{currentStep > 0 && currentStep < 3 && (
					<ModeSwitcher
						isRegistering={isRegistering}
						onSwitch={handleModeSwitch}
					/>
				)}
				{getCurrentStepContent()}
			</StepLayout>

			{showEmailVerification && (
				<EmailVerificationModal
					email={email}
					onClose={() => {
						setShowEmailVerification(false);
						if (!showTokenModal) {
							router.push('/chat');
						}
					}}
					dict={dict}
				/>
			)}

			{showTokenModal && tokenModalData && (
				<SaveTokenModal
					token={tokenModalData.token}
					animalSelection={selectedAnimals}
					hasSavedToken={hasSavedToken}
					setHasSavedToken={setHasSavedToken}
					onClose={() => {
						setShowTokenModal(false);
						if (tokenModalData.isNewUser) {
							router.push(`/${tokenModalData.lang}/welcome`);
						} else {
							router.push(`/${tokenModalData.lang}/chat`);
						}
					}}
					isNewUser={tokenModalData.isNewUser}
					lang={tokenModalData.lang}
					dict={dict}
				/>
			)}
		</div>
	);
};

export default memo(AuthPage);
