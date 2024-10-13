// components/token/ShowTokenAmount.jsx
'use client';

import React, { memo, useState } from 'react';
import { Coins } from 'lucide-react';
import TokenSlider from './TokenSlider';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { IoAdd } from 'react-icons/io5';

const ShowTokenAmount = () => {
	const { tokenBalance } = useAuth();

	return (
		<>
			<Link
				href='/token'
				className='flex items-center mt-1 cursor-pointer select-none'>
				<Coins className='mr-2' />
				<span className='text-md font-semibold'>{tokenBalance}</span>
				<IoAdd />
			</Link>
		</>
	);
};

export default memo(ShowTokenAmount);
