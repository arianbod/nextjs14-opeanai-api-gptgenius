// components/auth/Register.jsx
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

const Register = ({ onRegister }) => {
	const [selectedAnimals, setSelectedAnimals] = useState([]);
	const [email, setEmail] = useState('');

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

		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					animalSelection: selectedAnimals,
					email: email || null,
				}),
			});

			if (!response.ok) {
				throw new Error('Registration failed');
			}

			const data = await response.json();
			toast.success('Registration successful! Please save your token.');
			onRegister(data);
		} catch (error) {
			toast.error('Registration failed. Please try again.');
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='space-y-4'>
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
			<div>
				<label className='block mb-2'>Email (optional):</label>
				<input
					type='email'
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className='w-full p-2 border rounded'
				/>
			</div>
			<button
				type='submit'
				className='w-full p-2 bg-blue-500 text-white rounded'>
				Register
			</button>
		</form>
	);
};

export default Register;
