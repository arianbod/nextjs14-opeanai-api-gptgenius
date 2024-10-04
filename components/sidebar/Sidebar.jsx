// components/Sidebar.jsx
'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import SidebarHeader from './SidebarHeader';
import MemberProfile from './MemberProfile';
import { useAuth } from '@/context/AuthContext';
import { FaBars } from 'react-icons/fa';
import { MdAdd, MdClose } from 'react-icons/md';

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
			<div
				className={`lg:hidden fixed top-4 left-4 transition-all ${
					sidebarOpen && '-translate-x-3/4'
				} z-50`}>
				<button
					onClick={() => setSidebarOpen(!sidebarOpen)}
					className='btn btn-square btn-ghost text-primary-content backdrop-blur-md bg-glassLight dark:bg-glassLight'>
					{sidebarOpen ? (
						<MdClose className='w-6 h-6' />
					) : (
						<FaBars className='w-6 h-6' />
					)}
				</button>
			</div>

			{/* Sidebar */}
			<div
				className={`fixed inset-y-0 left-0 z-40 transform ${
					sidebarOpen ? 'translate-x-0' : '-translate-x-full'
				} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
				<div className='flex flex-col h-full backdrop-blur-md bg-glassLight dark:bg-glassDark shadow-lg'>
					<SidebarHeader />
					<div className='flex-1 overflow-y-auto px-4'>
						<div className='flex items-center justify-between mb-6'>
							<h3 className='text-md font-semibold text-white/50 '>
								Conversations
							</h3>
							<button className='btn btn-primary btn-md rounded-full shadow-md hover:shadow-lg transition-shadow'>
								<MdAdd className='w-6 h-6' />
							</button>
						</div>
						<ul className='space-y-4'>
							{chats.map((chat) => (
								<li key={chat.id}>
									<Link
										href={`/chat/${chat.id}`}
										className='flex items-center p-3 rounded-xl  bg-opacity-30 hover:translate-x-2 transition'
										onClick={() => setSidebarOpen(false)}>
										<span className='truncate text-sm font-medium text-white'>
											{chat.title}
										</span>
									</Link>
								</li>
							))}
						</ul>
					</div>
					<MemberProfile />
				</div>
			</div>

			{/* Overlay */}
			{sidebarOpen && (
				<div
					className='fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden'
					onClick={() => setSidebarOpen(false)}></div>
			)}
		</>
	);
};

export default Sidebar;
