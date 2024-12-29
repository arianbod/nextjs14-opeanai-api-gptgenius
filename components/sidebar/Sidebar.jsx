// Sidebar.jsx
'use client';

import React, { memo, useState } from 'react';
import Link from 'next/link';
import SidebarHeader from './SidebarHeader';
import MemberProfile from './member-profile/MemberProfile';
import { useAuth } from '@/context/AuthContext';
import { FaBars } from 'react-icons/fa';
import { MdAdd, MdClose } from 'react-icons/md';
import { BsPinAngle, BsPinAngleFill } from 'react-icons/bs';
import { HiChevronRight, HiChevronLeft } from 'react-icons/hi';
import { useChat } from '@/context/ChatContext';
import { useTranslations } from '@/context/TranslationContext';
import SingleChat from './SingleChat';
import { AIPersonas } from '@/lib/Personas';

const Sidebar = ({ isPinned, setIsPinned, isHovered, setIsHovered }) => {
	const { user } = useAuth();
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
	const { chatList, resetChat } = useChat();
	const { dict, isRTL } = useTranslations();

	if (!user) {
		return null;
	}

	const getPersonaByChat = (chat) => {
		if (!chat.provider || !chat.modelCodeName) return null;
		return AIPersonas.find(
			(p) =>
				p.provider === chat.provider && p.modelCodeName === chat.modelCodeName
		);
	};

	const handleMouseEnter = () => {
		if (!isPinned) {
			setIsHovered(true);
		}
	};

	const handleMouseLeave = () => {
		if (!isPinned) {
			setIsHovered(false);
		}
	};

	return (
		<>
			{/* Mobile hamburger button */}
			<div
				className={`lg:hidden fixed top-3 ${
					isRTL ? 'right-0' : 'left-0'
				} flex transition-all rounded-full ${
					mobileSidebarOpen ? 'hidden' : ''
				} z-50`}>
				<button
					onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
					className='p-2'>
					{mobileSidebarOpen ? (
						<MdClose className='w-6 h-6' />
					) : (
						<FaBars className='w-6 h-6' />
					)}
				</button>
			</div>

			{/* Desktop hover trigger area when sidebar is not pinned */}
			{!isPinned && (
				<div
					className={`hidden lg:flex fixed ${
						isRTL ? 'right-0' : 'left-0'
					} top-0 w-8 h-full z-30 items-center group cursor-pointer hover:bg-base-300/20`}
					onMouseEnter={handleMouseEnter}>
					{/* Hover indicator */}
					<div
						className={`flex items-center gap-2 px-1 py-3 ${
							isRTL ? 'rounded-l-lg' : 'rounded-r-lg'
						} bg-base-300/40 group-hover:bg-base-300/60 transition-colors`}>
						{isRTL ? (
							<HiChevronLeft className='w-6 h-6 text-base-content/50 group-hover:text-base-content/70' />
						) : (
							<HiChevronRight className='w-6 h-6 text-base-content/50 group-hover:text-base-content/70' />
						)}
					</div>
				</div>
			)}

			{/* Sidebar */}
			<div
				className={`fixed inset-y-0 ${
					isRTL ? 'right-0' : 'left-0'
				} z-40 w-80 transform 
          ${
						mobileSidebarOpen
							? 'translate-x-0'
							: isRTL
							? 'translate-x-full'
							: '-translate-x-full'
					}
          ${
						isPinned || isHovered
							? 'lg:translate-x-0'
							: isRTL
							? 'lg:translate-x-full'
							: 'lg:-translate-x-full'
					}
          transition-transform duration-300 ease-in-out`}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}>
				<div className='flex flex-col h-full bg-base-200 shadow-lg relative'>
					{/* Pin button - Positioned at top right/left based on RTL */}
					<button
						className={`hidden lg:flex absolute top-4 ${
							isRTL ? 'left-4' : 'right-4'
						} items-center justify-center hover:bg-base-300 rounded-full transition-all p-2 z-50`}
						onClick={() => setIsPinned(!isPinned)}
						title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}>
						{isPinned ? (
							<BsPinAngleFill className='w-5 h-5' />
						) : (
							<BsPinAngle className='w-5 h-5' />
						)}
					</button>

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

			{/* Mobile overlay */}
			{mobileSidebarOpen && (
				<div
					className='fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden'
					onClick={() => setMobileSidebarOpen(false)}
				/>
			)}
		</>
	);
};

export default memo(Sidebar);
