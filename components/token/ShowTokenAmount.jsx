// components/token/ShowTokenAmount.jsx
'use client';
import React, { memo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FaCoins } from 'react-icons/fa';
import { Coins, CoinsIcon, HandCoins } from 'lucide-react';

const ShowTokenAmount = () => {
	const { tokenBalance } = useAuth();
	return (
		<div className='flex items-center mt-1'>
			<Coins className='mr-2' />
			<span className='text-md font-semibold'>{tokenBalance}</span>
		</div>
	);
};

export default memo(ShowTokenAmount);
