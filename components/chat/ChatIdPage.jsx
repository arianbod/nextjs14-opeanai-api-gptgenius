'use client';
import React, { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import ModelSelection from './ModelSelection';
import { createChat, getChatMessages } from '@/server/chat';
import Loading from '../Loading';
import { useAuth } from '@/context/AuthContext';
import Chat from './Chat';
import { useChat } from '@/context/ChatContext';

const ChatIdPage = ({ chatId }) => {
	const { model, setModel, activeChat, setActiveChat, messages, setMessages } =
		useChat();
	const router = useRouter();
	const { user } = useAuth();
	const [isLoading, setIsLoading] = useState(false);

	const fetchChatData = useCallback(async () => {
		if (!chatId || !user) return;

		try {
			setIsLoading(true);
			const fetchedMessages = await getChatMessages(user.userId, chatId);
			if (fetchedMessages.length > 0) {
				const initialMessage = fetchedMessages[0].content.split(',')[0].trim();
				const selectedModel =
					AIPersonas.find((p) => p.name === initialMessage) || AIPersonas[0];
				setActiveChat({
					id: chatId,
					title: '',
					model: selectedModel,
					engine: selectedModel.engine,
					role: selectedModel.role,
					name: selectedModel.name,
				});
				setModel(selectedModel);
				setMessages(fetchedMessages);
			} else {
				// If no messages, treat as a new chat
				setActiveChat({
					id: chatId,
					title: '',
					model: null,
					engine: '',
					role: '',
					name: '',
				});
				setMessages([]);
			}
		} catch (error) {
			console.error('Error fetching chat data:', error);
			toast.error('Failed to load chat data. Please try again.');
			setMessages([]);
		} finally {
			setIsLoading(false);
		}
	}, [chatId, user, setActiveChat, setModel, setMessages]);

	useEffect(() => {
		fetchChatData();
	}, [fetchChatData]);

	if (!user || isLoading) {
		return <Loading />;
	}

	if (!chatId || !activeChat.model) {
		return null;
	}

	return (
		<Chat
			user={user}
		/>
	);
};

export default ChatIdPage;
