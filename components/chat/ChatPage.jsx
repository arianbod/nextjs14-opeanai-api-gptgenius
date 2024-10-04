'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import ModelSelection, { AIPersonas } from './ModelSelection';
import { createChat, getChatMessages } from '@/server/chat';
import Loading from '../Loading';
import { useAuth } from '@/context/AuthContext';
import Chat from './Chat';
import { useChat } from '@/context/ChatContext';

const EnhancedChat = ({ chatId }) => {
	const { setActiveChat } = useChat();
	const router = useRouter();
	const [chatData, setChatData] = useState(null);
	const [selectedModel, setSelectedModel] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const { user } = useAuth();

	const fetchChatData = useCallback(async () => {
		if (!chatId || !user) return;

		try {
			setIsLoading(true);
			console.log('Fetching chat data for chat:', chatId);
			const messages = await getChatMessages(user.userId, chatId);
			if (messages.length > 0) {
				const model =
					AIPersonas.find(
						(p) => p.name === messages[0].content.split(',')[0].trim()
					) || AIPersonas[0];
				setChatData({ model, messages });
				setSelectedModel(model);
			} else {
				// If no messages, treat as a new chat
				setChatData({ model: selectedModel, messages: [] });
			}
			console.log('Chat data fetched successfully');
		} catch (error) {
			console.error('Error fetching chat data:', error);
			toast.error('Failed to load chat data. Please try again.');
			setChatData({ model: selectedModel, messages: [] });
		} finally {
			setIsLoading(false);
		}
	}, [chatId, user, selectedModel]);

	useEffect(() => {
		fetchChatData();
	}, [fetchChatData]);

	useEffect(() => {
		if (chatId) {
			setActiveChat({ id: chatId, title: '' });
		}
	}, [chatId, setActiveChat]);

	const handleModelSelect = async (model) => {
		console.log('Model selected:', model);
		setSelectedModel(model);

		if (!user || !user.userId) {
			console.error('No user ID found');
			toast.error('Please log in to create a new chat.');
			return;
		}

		try {
			setIsLoading(true);
			const chatTitle = 'New Chat';
			console.log(
				'Creating new chat for user:',
				user.userId,
				'with title:',
				chatTitle
			);
			const newChat = await createChat(user.userId, chatTitle);
			console.log('New chat created:', newChat);

			if (!newChat || !newChat.id) {
				throw new Error(
					'Failed to create new chat: Invalid response from server'
				);
			}

			console.log('Navigating to new chat:', `/chat/${newChat.id}`);
			router.push(`/chat/${newChat.id}`);
		} catch (error) {
			console.error('Error creating new chat:', error);
			toast.error(`Failed to create a new chat: ${error.message}`);
		} finally {
			setIsLoading(false);
		}
	};

	if (!user || isLoading) {
		return <Loading />;
	}

	if (!chatId || !chatData) {
		return (
			<div className='flex flex-col no-scrollbar'>
				<ModelSelection
					onSelect={handleModelSelect}
					selectedModel={selectedModel}
				/>
			</div>
		);
	}

	return (
		<Chat
			chatId={chatId}
			chatData={chatData}
			user={user}
			selectedPersona={chatData.model}
			handleChangeModel={handleModelSelect}
		/>
	);
};

export default EnhancedChat;
