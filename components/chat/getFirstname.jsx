// GetFirstname.js
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs'; // Assuming useUser is the correct hook
import { BsChatRightText } from 'react-icons/bs';

const GetFirstname = () => {
	const [firstName, setFirstName] = useState('dear');
	const { user } = useUser(); // Clerk provides hooks to access user info

	useEffect(() => {
		// Directly use the user object from Clerk's hook
		if (user) {
			setFirstName('dear ' + user.firstName);
		}
	}, [user]); // Re-run effect if the user object changes
	return (
		<li className='flex items-baseline gap-3 py-6 px-4 text-lg leading-loose border-b border-base-300 bg-base-100 px-12'>
			<span className='avatar'>
				<BsChatRightText />
			</span>
			<p className='max-w-3xl'>
				Hi {firstName}, I'm so happy you are here. Let me know how I can help
				you.
			</p>
		</li>
	);
};

export default GetFirstname;
