'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { nanoid } from 'nanoid';
import ModelSelection, { AIPersonas } from './ModelSelection';
import ChatInterface from './ChatInterface';
import ImageGenerationInterface from './ImageGenerationInterface';
import Header from './Header';
import MessageInput from './MessageInput';

const EnhancedChat = ({ chatId }) => {
	const router = useRouter();
	const { isLoaded, isSignedIn, user } = useUser();
	const [chatData, setChatData] = useState(null);
	const [selectedModel, setSelectedModel] = useState(null);
	const [inputText, setInputText] = useState('');

	useEffect(() => {
		if (chatId) {
			const storedChat = localStorage.getItem(chatId);
			if (storedChat) {
				const parsedChatData = JSON.parse(storedChat);
				setChatData(parsedChatData);
				setSelectedModel(parsedChatData.model);
			} else {
				// Handle case where chatId is provided but no data found
				router.push('/chat');
			}
		}
	}, [chatId, router]);

	const handleModelSelect = (model) => {
		setSelectedModel(model);
	};

	const createNewChat = (model, initialMessage = null) => {
		const newChatId = nanoid();
		const chatHistory = [
			{
				id: nanoid(),
				role: 'system',
				content: `You are ${model.name}, a ${model.role}.`,
				timestamp: new Date().toISOString(),
			},
		];

		if (initialMessage) {
			chatHistory.push({
				id: nanoid(),
				role: 'user',
				content: initialMessage,
				timestamp: new Date().toISOString(),
			});
		}

		const newChatData = {
			model: model,
			messages: chatHistory,
		};

		localStorage.setItem(newChatId, JSON.stringify(newChatData));
		setChatData(newChatData);
		setSelectedModel(model);
		router.push(`/chat/${newChatId}`);
	};

	const handleNewChatSubmit = (e) => {
		e.preventDefault();
		if (!inputText.trim() || !selectedModel) return;
		createNewChat(selectedModel, inputText);
	};

	const handleChangeModel = (newModel) => {
		createNewChat(newModel);
	};

	if (!isLoaded) {
		return <div>Loading...</div>;
	}

	if (!isSignedIn) {
		return <div>Please sign in to use the chat.</div>;
	}

	// For new chat page
	if (!chatId) {
		return (
			<div className='flex flex-col h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900'>
				<div className='flex-grow overflow-auto'>
					<ModelSelection
						onSelect={handleModelSelect}
						selectedModel={selectedModel}
					/>
				</div>
				<div className='p-4'>
					<MessageInput
						inputText={inputText}
						setInputText={setInputText}
						handleSubmit={handleNewChatSubmit}
						isPending={false}
						isDisabled={!selectedModel}
					/>
				</div>
			</div>
		);
	}

	// For existing chat page
	if (!chatData) {
		return <div>Loading chat data...</div>;
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900'>
			<div className='max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden'>
				<div className='h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] flex flex-col'>
					<Header
						selectedPersona={chatData.model}
						onChangeModel={handleChangeModel}
						AIPersonas={AIPersonas}
					/>

					{chatData.model.name === 'DALL-E' ? (
						<ImageGenerationInterface
							userId={user.id}
							chatId={chatId}
						/>
					) : (
						<ChatInterface
							persona={chatData.model}
							chatId={chatId}
							initialMessages={chatData.messages}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default EnhancedChat;
