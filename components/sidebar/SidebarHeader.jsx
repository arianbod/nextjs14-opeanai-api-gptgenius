import React from 'react';
import ThemeToggle from './ThemeToggle';
import { SiOpenaigym } from 'react-icons/si';
import Link from 'next/link';
import Image from 'next/image';
import { global } from '@/lib/dic/en';
import ShowTokenAmount from '../token/ShowTokenAmount';
const SidebarHeader = ({ userId }) => {
	return (
		<Link
			href='/'
			className='flex justify-between items-center mb-4 gap-4 px-4'>
			<div className='flex gap-2'>
				<Image
					height={300}
					width={300}
					alt='logo'
					src='/babagpt_bw.svg'
					className='w-12 h-12 animate-[pulse 6s cubic-bezier(0.4, 0, 0.6, 1)] bg-blue-800/75 rounded-full p-1'
				/>
				<h2>
					<span className='text-lg font-bold mr- capitalize text-primary '>
						{global.title}
					</span>
					{userId && <ShowTokenAmount userId={userId} />}
				</h2>
			</div>

			<ThemeToggle />
		</Link>
	);
};

export default SidebarHeader;
