// components/MemberProfile.jsx
'use client';
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { FiLogOut } from 'react-icons/fi';

const MemberProfile = () => {
	const { user, logout } = useAuth();

	if (!user) {
		return null;
	}

	const handleSignOut = () => {
		logout();
	};

	return (
		<div className='flex items-center justify-between py-4 px-4 border-t border-base-300'>
			<div className='flex items-center gap-2'>
				<div className='bg-base-300 p-2 rounded-full'>
					<span className='text-sm font-medium'>
						{user.token.substring(0, 8)}...
					</span>
				</div>
			</div>
			<button
				onClick={handleSignOut}
				className='btn btn-sm btn-error flex items-center'>
				<FiLogOut className='mr-2' />
				Logout
			</button>
		</div>
	);
};

export default MemberProfile;
