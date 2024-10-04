// components/ThemeToggle.jsx
'use client';
import React, { useState, useEffect } from 'react';
import { BsMoonFill, BsSunFill } from 'react-icons/bs';

const themes = {
	winter: 'winter',
	dracula: 'dracula',
};

const ThemeToggle = () => {
	const [theme, setTheme] = useState(
		typeof window !== 'undefined' && localStorage.getItem('theme')
			? localStorage.getItem('theme')
			: themes.winter
	);

	useEffect(() => {
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	}, [theme]);

	const toggleTheme = () => {
		const newTheme = theme === themes.winter ? themes.dracula : themes.winter;
		setTheme(newTheme);
	};

	return (
		<button
			className='btn btn-circle btn-ghost'
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
