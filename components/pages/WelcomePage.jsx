'use client';
import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import Loading from '../Loading';
import Chat from '../chat/Chat';
import { FIRST_TIME_USER_CONFIG } from '@/lib/Personas';

const WelcomePage = () => {
	const { user } = useAuth();
	const {
		activeChat,
		isLoading,
		handleModelSelect,
		chatList,
		addMessage,
		model,
		messages,
	} = useChat();

	// Use a ref to track whether we've sent the welcome message
	const welcomeSent = useRef(false);

	useEffect(() => {
		const initializeWelcomeChat = async () => {
			if (!model) {
				handleModelSelect(FIRST_TIME_USER_CONFIG);
			}
		};

		if (user?.userId && !isLoading && !model) {
			initializeWelcomeChat();
		}
	}, [user?.userId, isLoading, model, handleModelSelect]);

	// Separate effect for adding the welcome message directly
	useEffect(() => {
		if (model && !welcomeSent.current && messages.length === 0 && !isLoading) {
			welcomeSent.current = true;
			// Add welcome message directly without generating a response
			addMessage({
				id: 'welcome-message',
				role: 'assistant',
				content:
					"👋 Welcome! I'm Claude, your AI assistant. I'm here to help you explore all the amazing things we can do together - from writing and analysis to coding and creative projects. What interests you most about AI assistance? I'd be happy to show you some examples!",
				timestamp: new Date().toISOString(),
			});
		}
	}, [model, messages.length, isLoading, addMessage]);

	if (!user || isLoading) {
		return <Loading />;
	}

	// Redirect to chat if user already has chats
	// if (chatList?.length > 0) {
	// 	const lang = window.location.pathname.split('/')[1] || 'en';
	// 	window.location.href = `/${lang}/chat`;
	// 	return null;
	// }

	return <Chat />;
};

export default WelcomePage;
