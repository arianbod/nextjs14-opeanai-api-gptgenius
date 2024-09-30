import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaEnvelope, FaPaw } from 'react-icons/fa';

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

function Register({ onRegister }) {
	const [selectedAnimals, setSelectedAnimals] = useState([]);
	const [email, setEmail] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

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
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					animalSelection: selectedAnimals,
					email: email || null,
				}),
			});

			if (!response.ok) throw new Error('Registration failed');

			const data = await response.json();
			toast.success('Registration successful! Please save your token.');
			onRegister(data);
		} catch (error) {
			toast.error('Registration failed. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4'>
			<div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden w-full max-w-md'>
				<div className='bg-gradient-to-r from-blue-500 to-purple-600 p-6'>
					<h2 className='text-3xl font-extrabold text-white text-center'>
						Register
					</h2>
				</div>
				<form
					onSubmit={handleSubmit}
					className='p-6 space-y-6'>
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

					<div className='relative'>
						<label
							htmlFor='email'
							className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
							Email (optional):
						</label>
						<input
							id='email'
							type='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className='w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
							placeholder='your@email.com'
						/>
						<FaEnvelope className='absolute left-3 top-9 text-gray-400 dark:text-gray-500' />
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
								Registering...
							</>
						) : (
							'Register'
						)}
					</button>
				</form>
			</div>
		</div>
	);
}

export default Register;
