// components/SidebarHeader.jsx
import React from 'react';
import ThemeToggle from './ThemeToggle';
import Link from 'next/link';
import Image from 'next/image';
import ShowTokenAmount from '../token/ShowTokenAmount';
import { useChat } from '@/context/ChatContext';
import { global } from '@/lib/dic/en';

const SidebarHeader = () => {
	const { resetChat } = useChat();
	return (
		<div className='flex items-center justify-between py-6 px-6'>
			<Link
				onClick={() => resetChat()}
				href='/'
				className='flex items-center gap-4'>
				<div className='relative w-14 h-14'>
					<Image
						alt='logo'
						src='/babagpt_bw.svg'
						layout='fill'
						className='rounded-full shadow-lg bg-slate-800 p-1'
					/>
				</div>
				<div>
					<h2 className='text-2xl tracking-wide capitalize font-thin'>
						{global.title}
					</h2>
					<ShowTokenAmount />
				</div>
			</Link>
			<ThemeToggle />
		</div>
	);
};

export default SidebarHeader;
