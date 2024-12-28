'use client';

import React, { memo, useState } from 'react';
import Link from 'next/link';
import SidebarHeader from './SidebarHeader';
import MemberProfile from './member-profile/MemberProfile';
import { useAuth } from '@/context/AuthContext';
import { FaBars } from 'react-icons/fa';
import { MdAdd, MdClose } from 'react-icons/md';
import { useChat } from '@/context/ChatContext';
import { useTranslations } from '@/context/TranslationContext';
import Image from 'next/legacy/image';
import { AIPersonas } from '@/lib/Personas';
import SingleChat from './SingleChat';

const Sidebar = () => {
	const { user } = useAuth();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const { chatList, resetChat } = useChat();
	const { dict } = useTranslations();

	if (!user) {
		return null;
	}

	const getPersonaByChat = (chat) => {
		if (!chat.provider || !chat.modelCodeName) return null;
		// Find the persona in the AIPersonas array
		return AIPersonas.find(
			(p) =>
				p.provider === chat.provider && p.modelCodeName === chat.modelCodeName
		);
	};

	return (
		<>
			{/* Mobile hamburger button */}
			<div
				className={`lg:hidden fixed top-3 left-0 flex transition-all rounded-full ${
					sidebarOpen ? 'hidden' : ''
				} z-50`}>
				<button
					onClick={() => setSidebarOpen(!sidebarOpen)}
					className='p-2'>
					{sidebarOpen ? (
						<MdClose className='w-6 h-6' />
					) : (
						<FaBars className='w-6 h-6' />
					)}
				</button>
			</div>

			{/* Sidebar */}
			<div
				className={`fixed inset-y-0 left-0 z-40 w-80 transform ${
					sidebarOpen ? 'translate-x-0' : '-translate-x-full'
				} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:inset-0`}>
				<div className='flex flex-col h-full bg-base-200 shadow-lg'>
					<SidebarHeader />
					<div className='flex-1 overflow-y-auto px-4'>
						<div className='flex items-center justify-between mb-6'>
							<h3 className='text-md font-semibold text-base-content/50'>
								{dict.sidebar.conversations}
							</h3>
							<Link
								onClick={() => resetChat()}
								href='/chat'
								className='flex items-center gap-4 hover:bg-base-300 rounded-full transition-all p-1'>
								<MdAdd className='w-6 h-6' />
							</Link>
						</div>
						<ul className='space-y-2 w-full'>
							{chatList.map((chat) => {
								const persona = getPersonaByChat(chat);
								const avatarUrl =
									persona?.avatar || '/images/default-avatar.png';
								const chatTitle = chat.title.replace(`"`, '');

								return (
									<SingleChat
										key={chat.id}
										chatId={chat.id}
										persona={persona}
										avatarUrl={avatarUrl}
										chatTitle={chatTitle}
									/>
								);
							})}
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

export default memo(Sidebar);
