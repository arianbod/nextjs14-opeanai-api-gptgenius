'use client';
import React, { useState } from 'react';
import { BsMoonFill, BsSunFill } from 'react-icons/bs';

const themes = {
	winter: 'winter',
	dracula: 'dracula',
};
const ThemeToggle = () => {
	const [theme, setTheme] = useState(themes.winter);
	// const userPref=
	const toggleTheme = () => {
		const newTheme = theme === themes.winter ? themes.dracula : themes.winter;
		document.documentElement.setAttribute('data-theme', newTheme);
		setTheme(newTheme);
	};
	return (
		<button
			className='rounded-full hover:border-2 hover:border-blue-500 p-1 transition-all'
			onClick={toggleTheme}>
			{theme === 'winter' ? (
				<BsMoonFill className='h-6 w-6' />
			) : (
				<BsSunFill className='h-6 w-6' />
			)}
		</button>
	);
};

export default ThemeToggle;
