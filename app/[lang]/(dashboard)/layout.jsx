'use client';
import Sidebar from '@/components/sidebar/Sidebar';
import { useTranslations } from '@/context/TranslationContext';
import React from 'react';

export default function DashboardLayout({ children }) {
	const { isRTL } = useTranslations();

	return (
		<>
			<Sidebar />
			<main
				className={`flex-1 mx-0 p-0 md:pt-0 max-w-full ${
					isRTL
						? 'lg:mr-80' // Right margin for RTL
						: 'lg:ml-80' // Left margin for LTR
				}`}>
				{children}
			</main>
		</>
	);
}
