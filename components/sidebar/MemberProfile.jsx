import React from 'react';
import { userButton, currentUser, auth, UserButton } from '@clerk/nextjs';
const MemberProfile = async () => {
	const user = await currentUser();
	const { userId } = auth();
	return (
		<div className='px-4 flex items-center gap-2 mr-auto'>
			<UserButton afterSignOutUrl='/' />
			<p>{user.firstName}</p>
		</div>
	);
};

export default MemberProfile;
