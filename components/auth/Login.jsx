import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaLock, FaPaw } from 'react-icons/fa';
import { MdLogin } from 'react-icons/md';

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

function Login({ onLogin }) {
	const [token, setToken] = useState('');
	const [selectedAnimals, setSelectedAnimals] = useState([]);

	const handleAnimalSelect = (animal) => {
		setSelectedAnimals((prev) => {
			if (prev.includes(animal)) {
				return prev.filter((a) => a !== animal);
			}
			if (prev.length < 3) {
				return [...prev, animal];
			}
			return prev;
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (selectedAnimals.length !== 3) {
			toast.error('Please select exactly 3 animals');
			return;
		}

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token, animalSelection: selectedAnimals }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Authentication failed');
			}

			toast.success(
				'Login successful! Please note your new token and animal selection.'
			);
			onLogin(data);
		} catch (error) {
			console.error('Login error:', error);
			toast.error(
				`Login failed: ${error.message}. Please check your token and animal selection.`
			);
		}
	};

	return (
		<div className='max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl'>
			<h2 className='text-2xl font-bold mb-6 text-center text-gray-800'>
				Login
			</h2>
			<form
				onSubmit={handleSubmit}
				className='space-y-6'>
				<div>
					<label
						htmlFor='token'
						className='block text-sm font-medium text-gray-700 mb-1'>
						Enter your token
					</label>
					<div className='relative'>
						<input
							id='token'
							type='text'
							value={token}
							onChange={(e) => setToken(e.target.value)}
							className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
							required
						/>
						<FaLock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
					</div>
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-700 mb-1'>
						Select 3 animals (in order)
					</label>
					<div className='grid grid-cols-3 gap-2'>
						{ANIMALS.map((animal) => (
							<button
								key={animal}
								type='button'
								onClick={() => handleAnimalSelect(animal)}
								className={`p-2 border rounded-md transition-colors duration-200 flex items-center justify-center ${
									selectedAnimals.includes(animal)
										? 'bg-blue-500 text-white border-blue-600'
										: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
								}`}>
								<FaPaw className='mr-1' />
								{animal}
							</button>
						))}
					</div>
				</div>

				<button
					type='submit'
					className='w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center justify-center'>
					<MdLogin className='mr-2' />
					Login
				</button>
			</form>
		</div>
	);
}

export default Login;
