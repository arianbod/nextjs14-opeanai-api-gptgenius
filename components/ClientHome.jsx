'use client';
import React, { useState, useEffect } from 'react';
import AuthPage from './auth/AuthPage';
import EnhancedChat from './chat/ChatPage';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/Loading';
import { useTranslations } from '@/context/TranslationContext';

const ClientHome = () => {
	const dict = useTranslations();
	const { user } = useAuth();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Simulate checking auth state
		const checkAuth = setTimeout(() => {
			setIsLoading(false);
		}, 1000);

		return () => clearTimeout(checkAuth);
	}, []);

	
	if (isLoading) {
		return <Loading />;
	}

	if (user === null) {
		return <AuthPage />;
	}

	return (
		<div>
			<main className='container mx-auto'>
				<EnhancedChat dict={dict} />
			</main>
		</div>
	);
};

export default ClientHome;
