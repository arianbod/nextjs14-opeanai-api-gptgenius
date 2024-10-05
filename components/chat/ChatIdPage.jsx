// ChatIdPage.js
'use client';
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Chat from './Chat';
import { useChat } from '@/context/ChatContext';
import Loading from '../Loading';

const ChatIdPage = ({ chatId }) => {
	const { activeChat, isLoading, fetchChatData } = useChat();
	const { user } = useAuth();

	useEffect(() => {
		if (chatId) {
			fetchChatData(chatId);
		}
	}, [chatId, fetchChatData]);

	if (!user || isLoading) {
		return <Loading />;
	}

	if (!chatId || !activeChat.model) {
		return null;
	}

	return <Chat />;
};

export default ChatIdPage;
