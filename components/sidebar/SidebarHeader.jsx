import React from 'react';
import ThemeToggle from './ThemeToggle';
import { SiOpenaigym } from 'react-icons/si';
import Link from 'next/link';
const SidebarHeader = () => {
	return (
		<Link
			href='/'
			className='flex items-center mb-4 gap-4 px-4'>
			<img
				src='/babagpt_bw.svg'
				className='w-24 h-24 animate-pulse bg-white rounded-full p-1'
			/>
			<h2 className='text-xl font-extrabold text-primary mr- capitalize'>
				babaGPT
			</h2>
			<ThemeToggle />
		</Link>
	);
};

export default SidebarHeader;
