import React from 'react';
import SidebarHeader from './SidebarHeader';
import NavLinks from './NavLinks';
import MemberProfile from './MemberProfile';

const navLinks = [
	{ href: '/chat', label: 'chat' },
	{ href: '/profile ', label: 'profile ' },
];
const Sidebar = () => {
	return (
		<div className='px-6 w-80 min-h-full bg-base-300 py-12 grid grid-rows-[auto,1fr,auto]'>
			{/* first row */}
			<SidebarHeader />
			{/* second row */}
			<NavLinks navLinks={navLinks} />
			{/* third row */}
			<MemberProfile />
		</div>
	);
};

export default Sidebar;
