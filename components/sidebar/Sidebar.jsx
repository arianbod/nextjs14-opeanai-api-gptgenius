// components/Sidebar.jsx
'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import SidebarHeader from './SidebarHeader';
import MemberProfile from './MemberProfile';
import { useAuth } from '@/context/AuthContext';

const Sidebar = () => {
	const { user } = useAuth();
	const [chats, setChats] = useState([]);

	useEffect(() => {
		const fetchChats = async () => {
			if (user?.userId) {
				try {
					const response = await fetch('/api/chat/getChatList', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ userId: user.userId }),
					});
					if (response.ok) {
						const data = await response.json();
						setChats(data.chats);
					} else {
						console.error('Failed to fetch chat list');
					}
				} catch (error) {
					console.error('Error fetching chat list:', error);
				}
			}
		};
		fetchChats();
	}, [user]);

	if (!user) {
		return null; // Or return a login prompt
	}

	return (
		<div className='px-6 w-80 h-screen bg-base-300 py-12 grid grid-rows-[auto,auto,1fr,auto]'>
			<SidebarHeader userId={user.userId} />
			<div className='overflow-y-auto max-h-[80vh]'>
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
			</div>
			<MemberProfile user={user} />
		</div>
	);
};

export default Sidebar;
