// app/welcome/page.js
'use client';
import { use } from 'react';
import WelcomePage from '@/components/pages/WelcomePage';
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query';

const page = () => {
	const queryClient = new QueryClient();
	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<WelcomePage />
		</HydrationBoundary>
	);
};

export default page;
