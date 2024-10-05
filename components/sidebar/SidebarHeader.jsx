// components/SidebarHeader.jsx
import React from 'react';
import ThemeToggle from './ThemeToggle';
import Link from 'next/link';
import Image from 'next/image';
import ShowTokenAmount from '../token/ShowTokenAmount';
import { useChat } from '@/context/ChatContext';

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
						className='rounded-full shadow-lg'
					/>
				</div>
				<div>
					<h2 className='text-2xl font-bold text-white tracking-wide'>
						BabaGPT
					</h2>
					<ShowTokenAmount />
				</div>
			</Link>
			<ThemeToggle />
		</div>
	);
};

export default SidebarHeader;
