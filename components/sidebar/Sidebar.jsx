// components/Sidebar.jsx
'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import SidebarHeader from './SidebarHeader';
import MemberProfile from './MemberProfile';
import { useAuth } from '@/context/AuthContext';
import { FaBars, FaPlus } from 'react-icons/fa';

const Sidebar = () => {
	const { user } = useAuth();
	const [chats, setChats] = useState([]);
	const [sidebarOpen, setSidebarOpen] = useState(false);

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
		return null;
	}

	return (
		<>
			{/* Mobile hamburger button */}
			<div className='lg:hidden fixed top-4 left-4 z-50'>
				<button
					onClick={() => setSidebarOpen(!sidebarOpen)}
					className='btn btn-square btn-ghost text-primary-content'>
					<FaBars className='w-6 h-6' />
				</button>
			</div>

			{/* Sidebar */}
			<div
				className={`fixed inset-y-0 left-0 z-40 w-64 bg-base-200 text-base-content transform ${
					sidebarOpen ? 'translate-x-0' : '-translate-x-full'
				} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
				<SidebarHeader />
				<div className='flex-1 overflow-y-auto px-4'>
					<div className='flex items-center justify-between mb-4'>
						<h3 className='text-lg font-semibold'>Your Chats</h3>
						<button className='btn btn-sm btn-primary'>
							<FaPlus className='mr-2' />
							New Chat
						</button>
					</div>
					<ul className='space-y-2'>
						{chats.map((chat) => (
							<li key={chat.id}>
								<Link
									href={`/chat/${chat.id}`}
									className='flex items-center p-2 rounded-md hover:bg-base-300 transition'
									onClick={() => setSidebarOpen(false)} // Close sidebar on mobile after selecting chat
								>
									<span className='truncate'>{chat.title}</span>
								</Link>
							</li>
						))}
					</ul>
				</div>
				<MemberProfile />
			</div>

			{/* Overlay */}
			{sidebarOpen && (
				<div
					className='fixed inset-0 bg-black opacity-50 z-30 lg:hidden'
					onClick={() => setSidebarOpen(false)}></div>
			)}
		</>
	);
};

export default Sidebar;
