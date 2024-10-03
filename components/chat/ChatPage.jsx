'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import ModelSelection, { AIPersonas } from './ModelSelection';
import { createChat, getChatMessages, addMessageToChat } from '@/server/chat';
import Loading from '../Loading';
import { useAuth } from '@/context/AuthContext';
import Chat from './Chat';

const EnhancedChat = ({ chatId }) => {
	const router = useRouter();
	const [chatData, setChatData] = useState(null);
	const [selectedModel, setSelectedModel] = useState(null);
	const [inputText, setInputText] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const { user } = useAuth();

	useEffect(() => {
		if (chatId && user) {
			const fetchChatData = async () => {
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
						setSelectedModel(AIPersonas[0]);
						setChatData({ model: AIPersonas[0], messages: [] });
					}
					console.log('Chat data fetched successfully');
				} catch (error) {
					console.error('Error fetching chat data:', error);
					toast.error('Failed to load chat data. Please try again.');
					setSelectedModel(AIPersonas[0]);
					setChatData({ model: AIPersonas[0], messages: [] });
				} finally {
					setIsLoading(false);
				}
			};
			fetchChatData();
		} else if (!chatId) {
			// If no chatId, set up for a new chat
			setSelectedModel(AIPersonas[0]);
			setChatData({ model: AIPersonas[0], messages: [] });
		}
	}, [chatId, user]);
	const handleModelSelect = async (model) => {
		console.log('Model selected:', model);
		setSelectedModel(model);
		setChatData((prev) => ({ ...prev, model }));
		await createNewChat(model);
	};
	const createNewChat = async (model, initialMessage = null) => {
		if (!user || !user.userId) {
			console.error('No user ID found');
			toast.error('Please log in to create a new chat.');
			return;
		}

		try {
			setIsLoading(true);
			const chatTitle = initialMessage
				? initialMessage.substring(0, 30) + '...'
				: 'New Chat';
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

			const systemMessage = {
				role: 'system',
				content: `${model.name}, ${model.role}`,
			};
			console.log('Adding system message:', systemMessage);
			await addMessageToChat(
				user.userId,
				newChat.id,
				systemMessage.content,
				systemMessage.role
			);

			if (initialMessage) {
				console.log('Adding initial message:', initialMessage);
				await addMessageToChat(user.userId, newChat.id, initialMessage, 'user');
			}

			setChatData({
				model,
				messages: [
					systemMessage,
					...(initialMessage
						? [{ role: 'user', content: initialMessage }]
						: []),
				],
			});
			setSelectedModel(model);
			console.log('Navigating to new chat:', `/chat/${newChat.id}`);
			router.push(`/chat/${newChat.id}`);
		} catch (error) {
			console.error('Error creating new chat:', error);
			toast.error(`Failed to create a new chat: ${error.message}`);
		} finally {
			setIsLoading(false);
		}
	};

	const handleNewChatSubmit = async (e) => {
		e.preventDefault();
		if (!inputText.trim() || !selectedModel || !user) return;
		await createNewChat(selectedModel, inputText);
	};

	const handleChangeModel = async (newModel) => {
		await createNewChat(newModel);
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
			handleChangeModel={handleChangeModel}
		/>
	);
};

export default EnhancedChat;
