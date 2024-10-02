// components/MemberProfile.jsx
'use client';
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { FiLogOut } from 'react-icons/fi';
import Loading from '../Loading';

const MemberProfile = () => {
	const { user, logout } = useAuth();

	if (!user) {
		return <Loading />;
	}

	const handleSignOut = () => {
		logout();
	};

	return (
		<div className='px-4 flex border-t-2 pt-4 justify-between w-full items-center gap-2 mr-auto'>
			<p>{user.token.substring(0, 8)}...</p>
			<button
				onClick={handleSignOut}
				className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors'>
				<FiLogOut />
			</button>
		</div>
	);
};

export default MemberProfile;
