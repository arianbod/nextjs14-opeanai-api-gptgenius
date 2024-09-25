'use client';
import { fetchOrGenerateTokens, fetchUserTokensById } from '@/server/action';
import { UserProfile, useAuth } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';
const ShowTokenAmount = () => {
	const { userId } = useAuth();
	const [currentTokens, setCurrentTokens] = useState(undefined);

	useEffect(() => {
		const fetchTokens = async () => {
			if (userId) {
				const tokens = await fetchUserTokensById(userId);
				console.log(tokens);

				setCurrentTokens(tokens);
				console.log('Fetched tokens:', tokens);
			} else {
				console.log('User ID is not available');
			}
		};

		fetchTokens();
	}, [userId]);

	if (currentTokens === undefined) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<h2 className=' text-white font-extrabold'>🪙{currentTokens}</h2>
			{currentTokens <= 0 && (
				<div className=' text-red-600'>
					Your tokens have been finished. You should recharge to use.
				</div>
			)}
		</div>
	);
};

export default ShowTokenAmount;
