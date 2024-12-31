// components/sidebar/Sidebar.jsx
'use client';

import React, { memo, useState } from 'react';
import Link from 'next/link';
import SidebarHeader from './SidebarHeader';
import MobileHeader from './MobileHeader'; // New component for mobile
import AccountSection from './TokenSection'; // New component
import TokenSection from './TokenSection'; // New component
import { useAuth } from '@/context/AuthContext';
import { FaBars } from 'react-icons/fa';
import { MdAdd, MdClose } from 'react-icons/md';
import { BsPinAngle, BsPinAngleFill } from 'react-icons/bs';
import { HiChevronRight, HiChevronLeft } from 'react-icons/hi';
import { useChat } from '@/context/ChatContext';
import { useTranslations } from '@/context/TranslationContext';
import SingleChat from './SingleChat';
import { AIPersonas } from '@/lib/Personas';
import MemberProfile from './member-profile/MemberProfile';
import { PenBoxIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
const Sidebar = ({ isPinned, setIsPinned, isHovered, setIsHovered }) => {
	const { user } = useAuth();
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
	const { chatList, resetChat } = useChat();
	const { dict, isRTL } = useTranslations();
	const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
	const params = useParams();

	if (!user) return null;

	const getPersonaByChat = (chat) => {
		if (!chat.provider || !chat.modelCodeName) return null;
		return AIPersonas.find(
			(p) =>
				p.provider === chat.provider && p.modelCodeName === chat.modelCodeName
		);
	};

	const handleMouseEnter = () => {
		if (!isPinned) setIsHovered(true);
	};

	const handleMouseLeave = () => {
		if (!isPinned) setIsHovered(false);
	};

	return (
		<>
			{/* Mobile Menu Button */}
			<div
				className={`lg:hidden fixed top-3 ${
					isRTL ? 'right-0' : 'left-0'
				} z-50 ${mobileSidebarOpen ? 'hidden' : ''}`}>
				<button
					onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
					className='p-4 bg-base-200/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-base-300/80 active:scale-95 transition-all'>
					{mobileSidebarOpen ? (
						<MdClose className='w-6 h-6' />
					) : (
						<FaBars className='w-6 h-6' />
					)}
				</button>
			</div>

			{/* Desktop Hover Area */}
			{!isPinned && (
				<div
					className={`hidden lg:flex fixed ${
						isRTL ? 'right-0' : 'left-0'
					} top-0 w-8 h-full z-30 items-center hover:bg-base-300/20 transition-colors`}
					onMouseEnter={handleMouseEnter}>
					<div
						className={`flex items-center gap-2 px-1 py-3 ${
							isRTL ? 'rounded-l-lg' : 'rounded-r-lg'
						} bg-base-300/40 hover:bg-base-300/60 transition-colors`}>
						{isRTL ? (
							<HiChevronLeft className='w-6 h-6 text-base-content/50' />
						) : (
							<HiChevronRight className='w-6 h-6 text-base-content/50' />
						)}
					</div>
				</div>
			)}

			{/* Main Sidebar */}
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
                transition-transform duration-200 ease-out`}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}>
				<div className='flex flex-col h-full bg-base-200 shadow-lg relative'>
					{/* Pin Button */}
					<button
						className={`hidden lg:flex absolute top-4 ${
							isRTL ? 'left-4' : 'right-4'
						} items-center justify-center hover:bg-base-300 rounded-full transition-colors p-2 z-50`}
						onClick={() => setIsPinned(!isPinned)}
						title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}>
						{isPinned ? (
							<BsPinAngleFill className='w-5 h-5' />
						) : (
							<BsPinAngle className='w-5 h-5' />
						)}
					</button>

					{/* Conditional Header Based on Device */}
					{isMobile ? <MobileHeader /> : <SidebarHeader />}

					{/* Token Section - New Prominent Position */}
					<TokenSection className='px-4 py-2 mb-2' />

					{/* Chat List - Expanded for Mobile */}
					<div className='flex-1 overflow-y-auto px-2'>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-md font-semibold text-base-content/50'>
								{dict.sidebar.conversations}
							</h3>
							<Link
								onClick={() => resetChat()}
								href={`${params.lang}/chat`}
								className='flex items-center gap-4 text-blue-500  hover:bg-base-300 rounded-full transition-colors p-2'>
								<PenBoxIcon className='w-6 h-6' />
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
										onSelect={() => setMobileSidebarOpen(false)}
									/>
								);
							})}
						</ul>
					</div>

					{/* Account Section - More Prominent */}
					{/* <AccountSection className='mt-auto' /> */}
					<MemberProfile />
				</div>
			</div>

			{/* Mobile Overlay */}
			{mobileSidebarOpen && (
				<div
					className='fixed inset-0 bg-black/50 backdrop-blur-[2px] z-30 lg:hidden transition-opacity duration-200'
					onClick={() => setMobileSidebarOpen(false)}
				/>
			)}
		</>
	);
};

export default memo(Sidebar);
