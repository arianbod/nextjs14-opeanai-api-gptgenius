'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

const MemberProfile = ({ user }) => {
	const router = useRouter();

	if (!user) {
		return <div>Loading...</div>;
	}

	const handleSignOut = () => {
		localStorage.removeItem('user');
		document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
		router.push('/');
	};

	return (
		<div className='px-4 flex items-center gap-2 mr-auto'>
			<button
				onClick={handleSignOut}
				className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors'>
				Sign Out
			</button>
			<p>{user.token.substring(0, 8)}...</p>
		</div>
	);
};

export default MemberProfile;
