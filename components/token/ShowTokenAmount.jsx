'use client';
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { FaCoins } from 'react-icons/fa';

const ShowTokenAmount = () => {
	const { tokenBalance } = useAuth();
	return (
		<div className='flex items-center mt-1 text-sm text-warning'>
			<FaCoins className='mr-1' />
			<span className='font-semibold'>{tokenBalance}</span>
		</div>
	);
};

export default ShowTokenAmount;
