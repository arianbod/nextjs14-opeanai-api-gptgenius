// components/auth/Login.jsx
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

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

const Login = ({ onLogin }) => {
	const [token, setToken] = useState('');
	const [selectedAnimals, setSelectedAnimals] = useState([]);

	const handleAnimalSelect = (animal) => {
		if (selectedAnimals.includes(animal)) {
			setSelectedAnimals(selectedAnimals.filter((a) => a !== animal));
		} else if (selectedAnimals.length < 3) {
			setSelectedAnimals([...selectedAnimals, animal]);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (selectedAnimals.length !== 3) {
			toast.error('Please select exactly 3 animals');
			return;
		}

		console.log('Sending login request:', {
			token,
			animalSelection: selectedAnimals,
		});

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token, animalSelection: selectedAnimals }),
			});

			const data = await response.json();
			console.log('Login response:', data);

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
		<form
			onSubmit={handleSubmit}
			className='space-y-4'>
			<div>
				<label className='block mb-2'>Enter your token:</label>
				<input
					type='text'
					value={token}
					onChange={(e) => setToken(e.target.value)}
					className='w-full p-2 border rounded'
					required
				/>
			</div>
			<div>
				<label className='block mb-2'>Select 3 animals (in order):</label>
				<div className='grid grid-cols-3 gap-2'>
					{ANIMALS.map((animal) => (
						<button
							key={animal}
							type='button'
							onClick={() => handleAnimalSelect(animal)}
							className={`p-2 border rounded ${
								selectedAnimals.includes(animal)
									? 'bg-blue-500 text-white'
									: 'bg-white'
							}`}>
							{animal}
						</button>
					))}
				</div>
			</div>
			<button
				type='submit'
				className='w-full p-2 bg-blue-500 text-white rounded'>
				Login
			</button>
		</form>
	);
};

export default Login;
