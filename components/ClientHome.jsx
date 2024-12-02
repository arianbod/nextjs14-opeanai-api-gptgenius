'use client';
import React, { useState, useEffect } from 'react';
import AuthPage from './auth/AuthPage';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/Loading';
import { useRouter } from 'next/navigation';

const ClientHome = () => {
	const { user } = useAuth();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Check auth state and redirect if necessary
		const checkAuthAndRedirect = async () => {
			try {
				if (user) {
					router.push('/chat'); // Changed from prefetch to push
				} else {
					setIsLoading(false);
				}
			} catch (error) {
				console.error('Error checking auth:', error);
				setIsLoading(false);
			}
		};

		checkAuthAndRedirect();
	}, [user, router]);

	// Show loading state while checking auth
	if (isLoading) {
		return <Loading />;
	}

	// Show auth page if user is not authenticated
	if (!user) {
		return <AuthPage />;
	}

	// This won't be shown as we're redirecting in useEffect
	return <Loading />;
};

export default ClientHome;
