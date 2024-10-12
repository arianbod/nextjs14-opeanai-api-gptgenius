// components/MemberProfile/MemberProfile.jsx
'use client';
import React, { memo } from 'react';
import { useAuth } from '@/context/AuthContext';
import Avatar from './Avatar';
import UserInfo from './UserInfo';
import LogoutButton from './LogoutButton';
import ShowAuthToken from './ShowAuthToken';

const MemberProfile = () => {
	const { user, logout } = useAuth();

	if (!user) {
		return null;
	}

	const handleSignOut = () => {
		logout();
	};

	return (
		<div>
			<ShowAuthToken />
			<div className='flex items-center justify-between py-6 px-6 bg-base-200'>
				<div className='flex items-center gap-3'>
					<Avatar initials={user.token.substring(0, 2).toUpperCase()} />
					<UserInfo token={user.token} />
				</div>
				<LogoutButton onLogout={handleSignOut} />
			</div>
		</div>
	);
};

export default memo(MemberProfile);
