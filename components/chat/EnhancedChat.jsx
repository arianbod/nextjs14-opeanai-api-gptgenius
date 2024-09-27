'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import ModelSelection, { AIPersonas } from './ModelSelection';
import ChatInterface from './ChatInterface';
import ImageGenerationInterface from './ImageGenerationInterface';
import Header from './Header';
import MessageInput from './MessageInput';
import { createChat, getChatMessages, addMessageToChat } from '@/server/chat';

const EnhancedChat = ({ chatId }) => {
	const router = useRouter();
	const { isLoaded, isSignedIn, user } = useUser();
	const [chatData, setChatData] = useState(null);
	const [selectedModel, setSelectedModel] = useState(null);
	const [inputText, setInputText] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (chatId && isSignedIn && user) {
			const fetchChatData = async () => {
				try {
					setIsLoading(true);
					const messages = await getChatMessages(user.id, chatId);
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
				} catch (error) {
					console.error('Error fetching chat data:', error);
					toast.error('Failed to load chat data. Please try again.');
					// Instead of redirecting, set up for a new chat
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
	}, [chatId, isSignedIn, user]);

	const handleModelSelect = (model) => {
		setSelectedModel(model);
		setChatData((prev) => ({ ...prev, model }));
	};

	const createNewChat = async (model, initialMessage = null) => {
		if (!isSignedIn || !user) return;

		try {
			setIsLoading(true);
			const chatTitle = initialMessage
				? initialMessage.substring(0, 30) + '...'
				: 'New Chat';
			const newChat = await createChat(user.id, chatTitle);

			const systemMessage = {
				role: 'system',
				content: `${model.name}, ${model.role}`,
			};
			await addMessageToChat(
				user.id,
				newChat.id,
				systemMessage.content,
				systemMessage.role
			);

			if (initialMessage) {
				await addMessageToChat(user.id, newChat.id, initialMessage, 'user');
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
			router.push(`/chat/${newChat.id}`);
		} catch (error) {
			console.error('Error creating new chat:', error);
			toast.error('Failed to create a new chat. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleNewChatSubmit = async (e) => {
		e.preventDefault();
		if (!inputText.trim() || !selectedModel || !isSignedIn || !user) return;
		await createNewChat(selectedModel, inputText);
	};

	const handleChangeModel = async (newModel) => {
		await createNewChat(newModel);
	};

	if (!isLoaded || isLoading) {
		return <div>Loading...</div>;
	}

	if (!isSignedIn) {
		return <div>Please sign in to use the chat.</div>;
	}

	if (!chatId || !chatData) {
		return (
			<div className='flex flex-col no-scrollbar'>
				<ModelSelection
					onSelect={handleModelSelect}
					selectedModel={selectedModel}
				/>
				<div className='p-4'>
					<MessageInput
						inputText={inputText}
						setInputText={setInputText}
						handleSubmit={handleNewChatSubmit}
						isPending={isLoading}
						isDisabled={!selectedModel}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900'>
			<div className='max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-xl overflow-hidden no-scrollbar'>
				<div className='h-[calc(100vh-3rem)] md:h-[calc(100vh-4rem)] flex flex-col overflow-hidden'>
					<Header
						selectedPersona={chatData.model}
						onChangeModel={handleChangeModel}
						AIPersonas={AIPersonas}
					/>

					{chatData.model.name === 'DALL-E' ? (
						<ImageGenerationInterface
							clerkId={user.id}
							chatId={chatId.toString()} // Ensure chatId is a string
						/>
					) : (
						<ChatInterface
							clerkId={user.id}
							persona={chatData.model}
							chatId={chatId.toString()} // Ensure chatId is a string
							initialMessages={chatData.messages}
							isPerplexity={chatData.model.engine === 'Perplexity'}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default EnhancedChat;
