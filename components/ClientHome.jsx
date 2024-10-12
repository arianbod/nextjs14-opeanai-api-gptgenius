'use client';
import React, { useState, useEffect } from 'react';
import AuthPage from './auth/AuthPage';
import EnhancedChat from './chat/ChatPage';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { FaCopy } from 'react-icons/fa';
import Loading from '@/components/Loading';
import { useTranslations } from '@/context/TranslationContext';
import { useParams } from 'next/navigation';

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

	const copyToken = () => {
		navigator.clipboard.writeText(user.token);
		toast.success(dict.auth.tokenCopied || 'Token copied to clipboard!');
	};

	if (isLoading) {
		return <Loading />;
	}

	if (user === null) {
		return <AuthPage />;
	}

	return (
		<div>
			<main className='container mx-auto'>
				<div>
					<div className='mb-4 p-4 bg-blue-900 rounded text-white pt-8 mx-auto place-context-center flex flex-col'>
						<h2 className='text-lg font-semibold mb-2 text-center'>
							{dict.auth.OTPTitle}
						</h2>
						<div className='flex items-center'>
							<input
								onClick={copyToken}
								type='text'
								value={user.token}
								readOnly
								className='cursor-pointer flex-grow h-8 px-2 border rounded-l bg-blue-500 animate-pulse font-bold text-center'
							/>
							<button
								onClick={copyToken}
								className='bg-blue-500 text-white px-4 h-8 rounded-r'>
								<FaCopy />
							</button>
						</div>
						<span className='text-sm text-center'>
							{dict.auth.OTPDescription}
						</span>
					</div>
					<EnhancedChat dict={dict} />
				</div>
			</main>
		</div>
	);
};

export default ClientHome;
