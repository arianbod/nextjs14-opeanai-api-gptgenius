// components/Sidebar.jsx
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import SidebarHeader from './SidebarHeader';
import MemberProfile from './MemberProfile';
import { useAuth } from '@/context/AuthContext';
import { FaBars } from 'react-icons/fa';
import { MdAdd, MdClose } from 'react-icons/md';
import { useChat } from '@/context/ChatContext';

const Sidebar = () => {
	const { user } = useAuth();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const { chatList, resetChat } = useChat();

	if (!user) {
		return null;
	}

	return (
		<>
			{/* Mobile hamburger button */}
			<div
				className={`lg:hidden fixed top-4 left-4 transition-transform ${
					sidebarOpen ? '-translate-x-3/4' : ''
				} z-50`}>
				<button
					onClick={() => setSidebarOpen(!sidebarOpen)}
					className='btn btn-square btn-ghost backdrop-blur-md bg-blue-900/50 text-white'>
					{sidebarOpen ? (
						<MdClose className='w-6 h-6' />
					) : (
						<FaBars className='w-6 h-6' />
					)}
				</button>
			</div>

			{/* Sidebar */}
			<div
				className={`fixed inset-y-0 left-0 z-40 w-72 transform ${
					sidebarOpen ? 'translate-x-0' : '-translate-x-full'
				} transition-transform duration-300 ease-in-out lg:translate-x-0  lg:inset-0`}>
				<div className='flex flex-col h-full backdrop-blur-md bg-glassLight dark:bg-glassDark shadow-lg'>
					<SidebarHeader />
					<div className='flex-1 overflow-y-auto px-4'>
						<div className='flex items-center justify-between mb-6'>
							<h3 className='text-md font-semibold text-white/50 '>
								Conversations
							</h3>
							<Link
								onClick={() => resetChat()}
								href='/'
								className='flex items-center gap-4 hover:bg-white/25 rounded-full transition-all p-1'>
								<MdAdd className='w-6 h-6' />
							</Link>
						</div>
						<ul className='space-y-4'>
							{chatList.map((chat) => (
								<li key={chat.id}>
									<Link
										href={`/chat/${chat.id}`}
										className='flex items-center p-3 rounded-xl bg-opacity-30 hover:translate-x-2 transition'
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
