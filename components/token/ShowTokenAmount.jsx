// components/token/ShowTokenAmount.jsx
'use client';

import React, { memo } from 'react';
import { Coins } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { IoAdd } from 'react-icons/io5';

const ShowTokenAmount = () => {
	const { tokenBalance } = useAuth();

	return (
		<Link
			href='/token'
			className='flex items-center space-x-1 cursor-pointer select-none text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
			aria-label='View token details'>
			<Coins size={18} />
			<span className='text-sm font-semibold'>{tokenBalance}</span>
			<IoAdd size={16} />
		</Link>
	);
};

export default memo(ShowTokenAmount);
