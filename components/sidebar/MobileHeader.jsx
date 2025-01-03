// components/sidebar/MobileHeader.jsx
import React from 'react';
import Image from 'next/legacy/image';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import { useChat } from '@/context/ChatContext';
import { useTranslations } from '@/context/TranslationContext';
import LocaleLink from '../hoc/LocalLink';

const MobileHeader = () => {
	const { resetChat } = useChat();
	const { dict } = useTranslations();

	return (
		<div className='p-2'>
			<div className='flex flex-col place-items-center justify-between mb-2'>
				{/* Logo and Title */}
				<LocaleLink
					onClick={() => resetChat()}
					href='/chat'
					className='relative flex items-center gap-2'>
					<div className='w-12 h-12 relative'>
						<Image
							alt='logo'
							src='/images/babagpt_bw.svg'
							layout='fill'
							objectFit='contain'
							className='rounded-full shadow-lg bg-slate-800'
						/>
					</div>
					<span className='font-semibold text-lg'>{dict.global.title}</span>
				</LocaleLink>

				{/* Theme and Language Toggles */}
				<div className='flex gap-1 place-items-center'>
					<ThemeToggle />
					<LanguageToggle />
				</div>
			</div>
		</div>
	);
};

export default MobileHeader;
