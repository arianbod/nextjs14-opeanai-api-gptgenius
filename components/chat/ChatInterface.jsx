// components/chat/ChatInterface.js
import React, { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { nanoid } from 'nanoid';
import { toast } from 'react-hot-toast';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import AILoadingIndicator from './AILoadingIndicator';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';

const ChatInterface = () => {
	const {
		messages,
		addMessage,
		updateMessage,
		removeMessage,
		activeChat,
		setActiveChat,
	} = useChat();
	const { user } = useAuth();
	const [inputText, setInputText] = useState('');
	const messagesEndRef = useRef(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(scrollToBottom, [messages]);

	const generateResponseMutation = useMutation({
		mutationFn: async (content) => {
			let chatId = activeChat.id;

			// If the chat hasn't been created yet, create it now
			if (!chatId) {
				// Create the chat via the API
				const response = await fetch('/api/chat/createChat', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						userId: user.userId,
						initialMessage: content,
					}),
				});

				if (!response.ok) {
					throw new Error('Failed to create new chat');
				}

				const newChat = await response.json();

				if (!newChat || !newChat.id) {
					throw new Error(
						'Failed to create new chat: Invalid response from server'
					);
				}

				chatId = newChat.id;

				// Update activeChat with the new chatId
				setActiveChat((prevActiveChat) => ({
					...prevActiveChat,
					id: chatId,
				}));

				// Update the URL without causing a navigation
				if (typeof window !== 'undefined') {
					window.history.replaceState(null, '', `/chat/${chatId}`);
				}
			}

			// Proceed to send the message and get the assistant's response
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId: user.userId,
					chatId: chatId,
					content,
					persona: activeChat.model,
				}),
			});

			if (!response.ok) throw new Error('Network response was not ok');
			return response;
		},
		onMutate: () => {
			const placeholderId = nanoid();
			addMessage({
				id: placeholderId,
				role: 'assistant',
				content: '',
				timestamp: new Date().toISOString(),
			});
			return { placeholderId };
		},
		onSuccess: async (response, _, context) => {
			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let accumulatedContent = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split('\n');
				for (const line of lines) {
					if (line.startsWith('data: ')) {
						try {
							const data = JSON.parse(line.slice(6));
							if (data.error) throw new Error(data.error);
							accumulatedContent += data.content || '';
							updateMessage(context.placeholderId, accumulatedContent);
							scrollToBottom();
						} catch (error) {
							console.error('Error parsing SSE data:', error);
						}
					}
				}
			}
		},
		onError: (error, _, context) => {
			console.error('Error in generateResponseMutation:', error);
			removeMessage(context.placeholderId);
			toast.error(`Failed to generate response: ${error.message}`);
		},
	});

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!inputText.trim()) return;

		const newMessage = {
			id: nanoid(),
			role: 'user',
			content: inputText,
			timestamp: new Date().toISOString(),
		};

		// Add the user's message to the local state for immediate feedback
		addMessage(newMessage);

		// Start the mutation to handle the assistant's response
		generateResponseMutation.mutate(inputText);

		setInputText('');
	};
	const msgLen = messages.length;
	return (
		<>
			{msgLen > 0 ? (
				<>
					<MessageList
						messages={messages}
						isLoading={generateResponseMutation.isPending}
						messagesEndRef={messagesEndRef}
					/>
					{generateResponseMutation.isPending && (
						<div className='mx-4 my-2'>
							<AILoadingIndicator />
						</div>
					)}
				</>
			) : (
				<div className='h-[30vh] w-full flex place-items-center place-content-center font-bold animate-pulse '>
					{' '}
					how can I assist you today?
				</div>
			)}
			<MessageInput
				msgLen={msgLen}
				inputText={inputText}
				setInputText={setInputText}
				handleSubmit={handleSubmit}
				isPending={generateResponseMutation.isPending}
			/>
		</>
	);
};

export default ChatInterface;
