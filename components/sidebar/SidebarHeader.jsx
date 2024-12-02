// components/SidebarHeader.jsx
import React, { memo } from 'react';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import Link from 'next/link';
import Image from 'next/image';
import ShowTokenAmount from '../token/ShowTokenAmount';
import { useChat } from '@/context/ChatContext';
import { useTranslations } from '@/context/TranslationContext';

const SidebarHeader = () => {
	const { resetChat } = useChat();
	const dict = useTranslations();

	return (
		<div className='flex flex-col py-6 px-6'>
			<div className='flex items-center justify-between mb-4'>
				<div className='flex items-center gap-4'>
					<Link
						onClick={() => resetChat()}
						href='/'
						className='relative w-14 h-14'>
						<Image
							alt='logo'
							src='/images/babagpt_bw.svg'
							layout='fill'
							className='rounded-full shadow-lg bg-slate-800 p-1'
						/>
					</Link>
					<div>
						<Link
							onClick={() => resetChat()}
							href='/chat'
							className='text-2xl tracking-wide capitalize font-semibold font-sans'>
							{dict.global.title}
						</Link>
						<div className='flex gap-2  place-items-center justify-start'>
							<ThemeToggle />
							<LanguageToggle />
						</div>
						{/* <ShowTokenAmount /> */}
					</div>
				</div>
			</div>
			<div className='flex justify-between space-x-2 place-items-center'></div>
		</div>
	);
};

export default memo(SidebarHeader);
