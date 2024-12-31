'use client';

import React, { useState, useRef, useEffect, memo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useParams } from 'next/navigation';
import { IoGlobe, IoChevronDown } from 'react-icons/io5';
import { usePreferences } from '@/context/preferencesContext';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from '@/context/TranslationContext';

const languages = [
	{ code: 'en', name: 'English', flag: '🇬🇧' },
	{ code: 'fa', name: 'فارسی', flag: '🇮🇷' },
	{ code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
	{ code: 'gr', name: 'Ελληνικά', flag: '🇬🇷' },
	{ code: 'ar', name: 'العربية', flag: '🇦🇪' },
	{ code: 'fr', name: 'Français', flag: '🇫🇷' },
	{ code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

const LanguageToggle = () => {
	const router = useRouter();
	const pathname = usePathname();
	const { lang } = useParams();
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);
	const { preferences, setLanguage, tempLanguage } = usePreferences();
	const { user } = useAuth();
	const { isRTL } = useTranslations();

	// Determine current language from URL first, then preferences or temp storage
	const currentLanguage =
		languages.find((l) => l.code === lang) || languages[0];

	const changeLanguage = async (newLang) => {
		if (newLang === lang) {
			setIsOpen(false);
			return;
		}

		const langDetails = languages.find((l) => l.code === newLang);
		if (!langDetails) {
			setIsOpen(false);
			return;
		}

		// Only try to update preferences if user is authenticated
		if (user?.userId) {
			try {
				await setLanguage(langDetails.code, langDetails.name);
			} catch (error) {
				console.error('Failed to update language preference:', error);
				// Continue with route change even if preference update fails
			}
		}

		// Always update the route
		const newPathname = pathname.replace(`/${lang}`, `/${newLang}`);
		router.push(newPathname);
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

	// Get frequently used languages only if user is authenticated and has preferences
	const frequentLanguages =
		user?.id && preferences?.languageHistory
			? preferences.languageHistory
					.sort((a, b) => b.useCount - a.useCount)
					.slice(0, 3)
					.map((lang) => ({
						...lang,
						details: languages.find((l) => l.code === lang.code),
					}))
					.filter((lang) => lang.details)
			: [];

	return (
		<div
			className='relative'
			ref={dropdownRef}>
			<button
				className='flex items-center space-x-2 hover:bg-base-200 text-base-content rounded-full py-2 px-3 transition-colors duration-200'
				onClick={() => setIsOpen(!isOpen)}>
				<IoGlobe className='h-5 w-5 font-bold' />
				<span className={`font-medium text-sm ${isRTL ? 'mr-2' : 'ml-2'}`}>
					{currentLanguage.name}
				</span>
				<IoChevronDown
					className={`h-4 w-4 transition-transform duration-100 ${
						isOpen ? 'rotate-180' : ''
					}`}
				/>
			</button>

			{isOpen && (
				<div
					className={`absolute mt-2 py-2 w-48 bg-base-100 rounded-lg shadow-xl z-20 border border-base-300 ${
						isRTL ? 'right-0' : 'left-0'
					}`}>
					{/* Only show frequently used section if user is authenticated and has history */}
					{user?.id && frequentLanguages.length > 0 && (
						<>
							<div className='px-4 py-1 text-xs text-base-content/50'>
								Recently Used
							</div>
							{frequentLanguages.map(({ code, details }) => (
								<button
									key={`frequent-${code}`}
									className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-base-200 transition-colors duration-150 ${
										code === currentLanguage.code
											? 'bg-primary/10 text-primary'
											: 'text-base-content'
									}`}
									onClick={() => changeLanguage(code)}>
									{/* <span>{details.flag}</span> */}
									<span className={isRTL ? 'mr-3' : 'ml-3'}>
										{details.name}
									</span>
								</button>
							))}
							<div className='border-t border-base-300 my-1' />
						</>
					)}

					{/* All languages section */}
					<div className='px-4 py-1 text-xs text-base-content/50'>
						All Languages
					</div>
					{languages.map((language) => (
						<button
							key={language.code}
							className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-base-200 transition-colors duration-150 ${
								language.code === currentLanguage.code
									? 'bg-primary/10 text-primary'
									: 'text-base-content'
							}`}
							onClick={() => changeLanguage(language.code)}>
							{/* <span>{language.flag}</span> */}
							<span className={isRTL ? 'mr-3' : 'ml-3'}>{language.name}</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
};

export default memo(LanguageToggle);
