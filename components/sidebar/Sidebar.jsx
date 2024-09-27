'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import SidebarHeader from './SidebarHeader';
import NavLinks from './NavLinks';
import MemberProfile from './MemberProfile';
import ShowTokenAmount from '../token/ShowTokenAmount';
import { getChatList } from '@/server/chat';

const navLinks = [{ href: '/', label: 'chat' }];

const Sidebar = () => {
	const { isLoaded, isSignedIn, user } = useUser();
	const [chats, setChats] = useState([]);

	useEffect(() => {
		const fetchChats = async () => {
			if (isSignedIn && user) {
				try {
					const chatList = await getChatList(user.id);
					setChats(chatList);
				} catch (error) {
					console.error('Error fetching chat list:', error);
				}
			}
		};
		fetchChats();
	}, [isSignedIn, user]);

	return (
		<div className='px-6 w-80 min-h-full bg-base-300 py-12 grid grid-rows-[auto,auto,1fr,auto]'>
			<SidebarHeader />
			<ShowTokenAmount />
			<div className='overflow-y-auto'>
				<h3 className='text-lg font-semibold mb-2'>Your Chats</h3>
				<ul className='menu text-base-content'>
					{chats.map((chat) => (
						<li key={chat.id}>
							<Link href={`/chat/${chat.id}`}>
								<span className='truncate'>{chat.title}</span>
							</Link>
						</li>
					))}
				</ul>
				<NavLinks navLinks={navLinks} />
			</div>
			<MemberProfile />
		</div>
	);
};

export default Sidebar;
