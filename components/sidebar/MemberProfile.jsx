'use client';

import { UserButton, useUser } from '@clerk/nextjs';

const MemberProfile = () => {
	const { user, isLoaded } = useUser();

	if (!isLoaded) {
		return <div>Loading...</div>;
	}

	return (
		<div className='px-4 flex items-center gap-2 mr-auto'>
			<UserButton afterSignOutUrl='/' />
			{user && <p>{user.firstName}</p>}
		</div>
	);
};

export default MemberProfile;
