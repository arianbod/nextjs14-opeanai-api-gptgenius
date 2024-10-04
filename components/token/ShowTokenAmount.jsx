// components/token/ShowTokenAmount.jsx
'use client';
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { FaCoins } from 'react-icons/fa';

const ShowTokenAmount = () => {
	const { tokenBalance } = useAuth();
	return (
		<div className='flex items-center mt-1 text-white'>
			<FaCoins className='mr-2 text-yellow-400' />
			<span className='text-md font-medium'>{tokenBalance}</span>
		</div>
	);
};

export default ShowTokenAmount;
