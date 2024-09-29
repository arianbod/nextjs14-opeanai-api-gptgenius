'use client';
import { manageUserTokens } from '@/server/chat';
import React, { useEffect, useState } from 'react';

const ShowTokenAmount = ({ userId }) => {
	const [currentTokens, setCurrentTokens] = useState(undefined);

	useEffect(() => {
		const fetchTokens = async () => {
			if (userId) {
				try {
					const tokens = await manageUserTokens(userId, 0); // Fetch tokens without changing the amount
					setCurrentTokens(tokens);
				} catch (error) {
					console.error('Error fetching tokens:', error);
					setCurrentTokens(0);
				}
			}
		};

		fetchTokens();
	}, [userId]);

	if (currentTokens === undefined) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<h2 className=' font-extrabold'>🪙{currentTokens}</h2>
			{currentTokens <= 0 && (
				<div className='text-red-600'>
					Your tokens have been depleted. Please recharge to continue using the
					service.
				</div>
			)}
		</div>
	);
};

export default ShowTokenAmount;
