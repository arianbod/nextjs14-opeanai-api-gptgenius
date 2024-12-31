// components/sidebar/MobileHeader.jsx
import React from 'react';
import Image from 'next/legacy/image';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import { useChat } from '@/context/ChatContext';
import { useTranslations } from '@/context/TranslationContext';

const MobileHeader = () => {
	const { resetChat } = useChat();
	const { dict } = useTranslations();

	return (
		<div className='p-2'>
			<div className='flex items-center justify-between mb-2'>
				{/* Logo and Title */}
				<Link
					onClick={() => resetChat()}
					href='/chat'
					className='relative flex items-center gap-2'>
					<div className='w-8 h-8 relative'>
						<Image
							alt='logo'
							src='/images/babagpt_bw.svg'
							layout='fill'
							objectFit='contain'
							className='rounded-full shadow-lg bg-slate-800 p-1'
						/>
					</div>
					<span className='font-semibold text-base'>{dict.global.title}</span>
				</Link>

				{/* Theme and Language Toggles */}
				<div className='flex gap-1'>
					<ThemeToggle />
					<LanguageToggle />
				</div>
			</div>
		</div>
	);
};

export default MobileHeader;
