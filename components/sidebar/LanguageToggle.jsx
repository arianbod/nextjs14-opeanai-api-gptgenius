'use client';
import React, { useState, useRef, useEffect, memo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useParams } from 'next/navigation';
import { IoLanguage, IoChevronDown } from 'react-icons/io5';

const languages = [
	{ code: 'en', name: 'English', flag: '🇬🇧' },
	{ code: 'fa', name: 'فارسی', flag: '🇮🇷' },
	{ code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
	// Add more languages as needed
];

const LanguageToggle = () => {
	const router = useRouter();
	const pathname = usePathname();
	const { lang } = useParams();
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);

	const changeLanguage = (newLang) => {
		if (newLang !== lang) {
			const newPathname = pathname.replace(`/${lang}`, `/${newLang}`);
			router.push(newPathname);
		}
		setIsOpen(false);
	};

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const currentLanguage =
		languages.find((l) => l.code === lang) || languages[0];

	return (
		<div
			className='relative'
			ref={dropdownRef}>
			<button
				className='flex items-center space-x-2  hover:bg-base-200 text-base-content rounded-full px-4 py-2 transition-colors duration-200'
				onClick={() => setIsOpen(!isOpen)}>
				<IoLanguage className='h-5 w-5 text-primary' />
				{/* <span className='font-medium'>{currentLanguage.flag}</span> */}
				{/* <span className='text-sm font-medium'>{currentLanguage.name}</span> */}
				<IoChevronDown
					className={`h-4 w-4 transition-transform duration-200 ${
						isOpen ? 'rotate-180' : ''
					}`}
				/>
			</button>
			{isOpen && (
				<div className='absolute right-0 mt-2 py-2 w-48 bg-base-100 rounded-lg shadow-xl z-20 border border-base-300'>
					{languages.map((language) => (
						<button
							key={language.code}
							className={`flex items-center space-x-3 w-full px-4 py-2 text-sm text-left hover:bg-base-200 transition-colors duration-150 ${
								language.code === lang
									? 'bg-primary/10 text-primary'
									: 'text-base-content'
							}`}
							onClick={() => changeLanguage(language.code)}>
							{/* <span className='text-xl'>{language.flag}</span> */}
							<span>{language.name}</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
};

export default memo(LanguageToggle);
