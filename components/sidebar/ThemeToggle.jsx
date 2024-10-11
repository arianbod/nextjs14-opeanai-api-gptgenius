// components/ThemeToggle.jsx
'use client';
import React, { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { BsMoonFill, BsSunFill } from 'react-icons/bs';

const ThemeToggle = () => {
	const { theme, setTheme } = useTheme();

	useEffect(() => {
		// Ensure the theme is applied to the html element
		document.documentElement.setAttribute('data-theme', theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme(theme === 'winter' ? 'dracula' : 'winter');
	};

	return (
		<button
			className='btn btn-circle btn-ghost text-base-content hover:bg-base-200 transition'
			onClick={toggleTheme}>
			{theme === 'winter' ? (
				<BsMoonFill className='h-5 w-5' />
			) : (
				<BsSunFill className='h-5 w-5' />
			)}
		</button>
	);
};

export default ThemeToggle;
