// components/SidebarHeader.jsx
import React from 'react';
import ThemeToggle from './ThemeToggle';
import Link from 'next/link';
import Image from 'next/image';
import { global } from '@/lib/dic/en';
import ShowTokenAmount from '../token/ShowTokenAmount';

const SidebarHeader = () => {
	return (
		<div className='flex items-center justify-between py-4 px-4'>
			<Link
				href='/'
				className='flex items-center gap-3'>
				<Image
					height={48}
					width={48}
					alt='logo'
					src='/babagpt_bw.svg'
					className='w-12 h-12 rounded-full p-1'
				/>
				<div>
					<h2 className='text-xl font-bold text-primary'>{global.title}</h2>
					<ShowTokenAmount />
				</div>
			</Link>
			<ThemeToggle />
		</div>
	);
};

export default SidebarHeader;
