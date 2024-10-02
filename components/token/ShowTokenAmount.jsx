'use client';
import React, { useEffect, useState } from 'react';
import Loading from '../Loading';
import { useAuth } from '@/context/AuthContext';

const ShowTokenAmount = () => {
	const { tokenBalance } = useAuth();
	return (
		<div>
			<h2 className='flex flex-col place-content-center text-center text-sm text-amber-600 font-bold'>
				{tokenBalance}
			</h2>
			{tokenBalance <= 0 && (
				<div className='text-red-600'>
					Your tokens have been depleted. Please recharge to continue using the
					service.
				</div>
			)}
		</div>
	);
};

export default ShowTokenAmount;
