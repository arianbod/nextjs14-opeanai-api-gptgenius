// DashboardLayout.jsx
'use client';
import Sidebar from '@/components/sidebar/Sidebar';
import { useTranslations } from '@/context/TranslationContext';
import React, { useState } from 'react';

export default function DashboardLayout({ children }) {
	const { isRTL } = useTranslations();
	const [isPinned, setIsPinned] = useState(true);
	const [isHovered, setIsHovered] = useState(false);

	const showSidebar = isPinned || isHovered;

	return (
		<>
			<Sidebar
				isPinned={isPinned}
				setIsPinned={setIsPinned}
				isHovered={isHovered}
				setIsHovered={setIsHovered}
			/>
			<main
				className={`flex-1 mx-0 p-0 md:pt-0 max-w-full transition-all duration-300 ${
					showSidebar
						? isRTL
							? 'lg:mr-80' // Right margin for RTL when sidebar is shown
							: 'lg:ml-80' // Left margin for LTR when sidebar is shown
						: 'lg:ml-0 lg:mr-0' // No margin when sidebar is hidden
				}`}>
				{children}
			</main>
		</>
	);
}
