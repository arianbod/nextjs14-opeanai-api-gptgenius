// components/auth/AuthPage.jsx
import React, { useState } from 'react';
import Register from './Register';
import Login from './Login';

const AuthPage = ({ onAuthenticated }) => {
	const [isRegistering, setIsRegistering] = useState(true);

	const handleRegister = (data) => {
		// Store the token and animal selection securely
		localStorage.setItem('user', JSON.stringify(data));
		// Set a cookie to indicate the user is logged in
		document.cookie = `user=${JSON.stringify(data)}; path=/;`;
		onAuthenticated(data);
	};

	const handleLogin = (data) => {
		// Store the new token and animal selection securely
		localStorage.setItem('user', JSON.stringify(data));
		// Set a cookie to indicate the user is logged in
		document.cookie = `user=${JSON.stringify(data)}; path=/;`;
		onAuthenticated(data);
	};

	return (
		<div className='max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl'>
			<h1 className='text-2xl font-bold mb-6 text-center'>
				{isRegistering ? 'Register' : 'Login'}
			</h1>
			{isRegistering ? (
				<Register onRegister={handleRegister} />
			) : (
				<Login onLogin={handleLogin} />
			)}
			<button
				onClick={() => setIsRegistering(!isRegistering)}
				className='mt-4 text-blue-500 hover:underline'>
				{isRegistering
					? 'Already have an account? Login'
					: 'Need an account? Register'}
			</button>
		</div>
	);
};

export default AuthPage;
