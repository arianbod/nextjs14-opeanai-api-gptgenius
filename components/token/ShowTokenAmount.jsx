'use client';
import { manageUserTokens } from '@/server/chat';
import { useUser } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';

const ShowTokenAmount = () => {
	const { isLoaded, isSignedIn, user } = useUser();
	const [currentTokens, setCurrentTokens] = useState(undefined);

	useEffect(() => {
		const fetchTokens = async () => {
			if (isSignedIn && user) {
				try {
					const tokens = await manageUserTokens(user.id, 0); // Fetch tokens without changing the amount
					setCurrentTokens(tokens);
				} catch (error) {
					console.error('Error fetching tokens:', error);
					setCurrentTokens(0);
				}
			}
		};

		if (isLoaded) {
			fetchTokens();
		}
	}, [isLoaded, isSignedIn, user]);

	if (!isLoaded || currentTokens === undefined) {
		return <div>Loading...</div>;
	}

	if (!isSignedIn) {
		return <div>Please sign in to view your tokens.</div>;
	}

	return (
		<div>
			<h2 className='text-white font-extrabold'>🪙{currentTokens}</h2>
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
