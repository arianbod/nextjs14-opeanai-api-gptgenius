// components/auth/AuthPage.jsx
'use client';
import React, { useState } from 'react';
import { FaEnvelope, FaPaw, FaLock } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

const ANIMALS = [
	'dog',
	'cat',
	'elephant',
	'lion',
	'tiger',
	'bear',
	'monkey',
	'giraffe',
	'zebra',
	'penguin',
	'kangaroo',
	'koala',
];

const AuthPage = () => {
	const { login, setUser, setTokenBalance } = useAuth();
	const [isRegistering, setIsRegistering] = useState(true);
	const [email, setEmail] = useState('');
	const [token, setToken] = useState('');
	const [selectedAnimals, setSelectedAnimals] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDarkMode, setIsDarkMode] = useState(false);

	const handleAnimalSelect = (animal) => {
		setSelectedAnimals((prev) => {
			if (prev.includes(animal)) return prev.filter((a) => a !== animal);
			if (prev.length < 3) return [...prev, animal];
			return prev;
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (selectedAnimals.length !== 3) {
			toast.error('Please select exactly 3 animals');
			return;
		}

		setIsSubmitting(true);
		try {
			const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
			const body = isRegistering
				? { email: email || null, animalSelection: selectedAnimals }
				: { token, animalSelection: selectedAnimals };

			const response = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Request failed');
			}

			const data = await response.json();

			// Set user state directly
			const userData = {
				userId: data.userId,
				token: data.token,
				tokenBalance: data.tokenBalance,
			};
			const timestamp = new Date().getTime();
			const userWithTimestamp = { ...userData, timestamp };
			setUser(userWithTimestamp);
			setTokenBalance(data.tokenBalance);
			localStorage.setItem('user', JSON.stringify(userWithTimestamp));
			document.cookie = `user=${JSON.stringify(userWithTimestamp)}; path=/;`;

			toast.success(`${isRegistering ? 'Registration' : 'Login'} successful!`);
		} catch (error) {
			toast.error(
				`${isRegistering ? 'Registration' : 'Login'} failed. Please try again.`
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const toggleDarkMode = () => {
		setIsDarkMode(!isDarkMode);
		document.documentElement.classList.toggle('dark');
	};

	return (
		<div
			className={`flex items-center justify-center p-4 transition-colors duration-300 ${
				isDarkMode ? 'dark' : ''
			}`}>
			<div className='w-full max-w-md'>
				<div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl  w-full'>
					<div className='bg-gradient-to-r from-blue-500 to-purple-600 p-6 flex justify-between items-center rounded-t-sm'>
						<h1 className='text-3xl font-bold text-white text-center mx-auto'>
							{isRegistering ? 'Register' : 'Login'}
						</h1>
					</div>
					<form
						onSubmit={handleSubmit}
						className='p-6 space-y-6'>
						{isRegistering && (
							<div className='relative'>
								<label
									htmlFor='email'
									className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
									Email:
								</label>
								<input
									id='email'
									type='email'
									value={email}
									required
									onChange={(e) => setEmail(e.target.value)}
									className='w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
									placeholder='your@email.com'
								/>
								<FaEnvelope className='absolute left-3 top-9 text-gray-400 dark:text-gray-500' />
							</div>
						)}
						{!isRegistering && (
							<div className='relative'>
								<label
									htmlFor='token'
									className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
									Enter your token:
								</label>
								<input
									id='token'
									type='text'
									value={token}
									onChange={(e) => setToken(e.target.value)}
									className='w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
									required
								/>
								<FaLock className='absolute left-3 top-9 text-gray-400 dark:text-gray-500' />
							</div>
						)}
						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
								Select 3 animals:
							</label>
							<div className='grid grid-cols-3 gap-2'>
								{ANIMALS.map((animal) => (
									<button
										key={animal}
										type='button'
										onClick={() => handleAnimalSelect(animal)}
										className={`p-2 rounded-lg transition-colors duration-200 flex items-center justify-center text-sm ${
											selectedAnimals.includes(animal)
												? 'bg-blue-500 text-white dark:bg-blue-600'
												: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
										}`}>
										<FaPaw className='mr-1' />
										{animal}
									</button>
								))}
							</div>
						</div>
						<button
							type='submit'
							disabled={isSubmitting}
							className={`w-full py-3 px-4 rounded-lg shadow-lg text-white font-medium text-lg transition-colors duration-200 flex items-center justify-center ${
								isSubmitting
									? 'bg-gray-400 dark:bg-gray-600'
									: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
							}`}>
							{isSubmitting ? (
								<>
									<svg
										className='animate-spin h-5 w-5 mr-3 text-white'
										xmlns='http://www.w3.org/2000/svg'
										fill='none'
										viewBox='0 0 24 24'>
										<circle
											className='opacity-25'
											cx='12'
											cy='12'
											r='10'
											stroke='currentColor'
											strokeWidth='4'></circle>
										<path
											className='opacity-75'
											fill='currentColor'
											d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
									</svg>
									{isRegistering ? 'Registering...' : 'Logging in...'}
								</>
							) : isRegistering ? (
								'Register'
							) : (
								'Login'
							)}
						</button>
					</form>
					<div className='px-6 pb-6'>
						<button
							onClick={() => setIsRegistering(!isRegistering)}
							className='w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200'>
							{isRegistering
								? 'Already have an account? Login'
								: 'Need an account? Register'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AuthPage;
