'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import SidebarHeader from './SidebarHeader';
import NavLinks from './NavLinks';
import MemberProfile from './MemberProfile';
import ShowTokenAmount from '../token/ShowTokenAmount';
import { getChatList } from '@/server/chat';

const navLinks = [{ href: '/', label: 'chat' }];

const Sidebar = () => {
	const [user, setUser] = useState(null);
	const [chats, setChats] = useState([]);

	useEffect(() => {
		// Check if user is authenticated
		const storedUser = localStorage.getItem('user');
		if (storedUser) {
			setUser(JSON.parse(storedUser));
		}
	}, []);

	useEffect(() => {
		const fetchChats = async () => {
			if (user) {
				try {
					const chatList = await getChatList(user.userId);
					setChats(chatList);
				} catch (error) {
					console.error('Error fetching chat list:', error);
				}
			}
		};
		fetchChats();
	}, [user]);

	return (
		<div className='px-6 w-80 min-h-full bg-base-300 py-12 grid grid-rows-[auto,auto,1fr,auto]'>
			<SidebarHeader />
			{user && (
				<>
					<ShowTokenAmount userId={user.userId} />
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
				</>
			)}
			{user && <MemberProfile user={user} />}
		</div>
	);
};

export default Sidebar;
