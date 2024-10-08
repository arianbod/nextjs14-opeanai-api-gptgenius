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
		<div className='flex items-center justify-between py-6 px-6 '>
			<div className='flex items-center gap-3'>
				<div className='w-10 h-10 bg-opacity-20 rounded-full flex items-center justify-center'>
					<span className='text-sm font-medium text-white'>
						{user.token.substring(0, 2).toUpperCase()}
					</span>
				</div>
				<div>
					<p className='text-sm text-white font-semibold'>
						{user.token.substring(0, 8)}...
					</p>
				</div>
			</div>
			<button
				onClick={handleSignOut}
				className='btn btn-sm btn-error text-white hover:bg-white hover:bg-opacity-20 transition'>
				<FiLogOut className='mr-2' />
			</button>
		</div>
	);
};

export default MemberProfile;
