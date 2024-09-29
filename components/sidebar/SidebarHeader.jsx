import React from 'react';
import ThemeToggle from './ThemeToggle';
import { SiOpenaigym } from 'react-icons/si';
import Link from 'next/link';
const SidebarHeader = () => {
	return (
		<Link
			href='/'
			className='flex items-center mb-4 gap-4 px-4'>
			<SiOpenaigym className='w-10 h-10 text-primary' />
			<h2 className='text-xl font-extrabold text-primary mr- capitalize'>
				babaGPT
			</h2>
			<ThemeToggle />
		</Link>
	);
};

export default SidebarHeader;
