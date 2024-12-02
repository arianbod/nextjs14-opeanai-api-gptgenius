// app/[lang]/(dashboard)/layout.js
import Sidebar from '@/components/sidebar/Sidebar';
import React from 'react';

export default function DashboardLayout({ children }) {
	return (
		<>
			<Sidebar />
			<main className='flex-1 mx-0 lg:ml-80 p-0 md:pt-0 max-w-full'>
				{children}
			</main>
		</>
	);
}
