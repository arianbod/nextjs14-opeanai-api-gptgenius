// components/chat/ChatInterface.js
import React, { memo, useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { nanoid } from 'nanoid';
import { toast } from 'react-hot-toast';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import AILoadingIndicator from './AILoadingIndicator';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import Header from './Header';

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
	const [greetingIndex, setGreetingIndex] = useState(0);
	const [showGreeting, setShowGreeting] = useState(true);

	const greetings = [
		'How can I assist you today?',
		"Ready to chat! What's on your mind?",
		"Let's explore some ideas together!",
		"I'm here to help. What would you like to know?",
		'Excited to learn from you. What shall we discuss?',
	];

	useEffect(() => {
		const interval = setInterval(() => {
			setShowGreeting(false);
			setTimeout(() => {
				setGreetingIndex((prevIndex) => (prevIndex + 1) % greetings.length);
				setShowGreeting(true);
			}, 300); // Wait for fade out before changing text
		}, 5000);
		return () => clearInterval(interval);
	}, []);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(scrollToBottom, [messages]);

	// Inside ChatInterface.jsx
	const generateResponseMutation = useMutation({
		mutationFn: async (content) => {
			let chatId = activeChat.id;

			if (!chatId) {
				const modelData = {
					name: activeChat.model.name,
					provider: activeChat.model.provider,
					modelCodeName: activeChat.model.modelCodeName,
					role: activeChat.model.role,
				};

				const response = await fetch('/api/chat/createChat', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						userId: user.userId,
						initialMessage: content,
						model: modelData,
					}),
				});

				const data = await response.json();
				// console.log("responseResult:",response.ok);

				if (!response.ok) {
					throw new Error(data.error || 'Failed to create chat');
				}
				// console.log('data id:', data.data.id);

				if (!data.data.id) {
					throw new Error('Invalid response from server');
				}

				chatId = data.data.id;
				setActiveChat((prev) => ({
					...prev,
					id: chatId,
				}));
				console.log(activeChat);

				window.history.replaceState(null, '', `/chat/${chatId}`);
			}

			// Continue with sending message...
			const messageResponse = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId: user.userId,
					chatId,
					content,
					persona: activeChat.model,
					provider: activeChat.provider,
				}),
			});

			if (!messageResponse.ok) {
				throw new Error('Failed to send message');
			}

			return messageResponse;
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

		addMessage(newMessage);
		generateResponseMutation.mutate(inputText);
		setInputText('');
	};

	return (
		<div className='flex  flex-col  max-h-full transition-colors duration-300'>
			<Header msgLen={messages.length} />
			{messages.length > 0 ? (
				<div className='flex-grow overflow-y-auto animate-fade-in-down'>
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
				</div>
			) : (
				<div className='h-[30vh] w-full flex items-center justify-center'>
					<h2
						className={`text-2xl font-bold  text-center px-4 transition-opacity duration-300 ${
							showGreeting ? 'opacity-100' : 'opacity-0'
						}`}>
						{greetings[greetingIndex]}
					</h2>
				</div>
			)}
			{/* <div className='mt-auto p-4 bg-white dark:bg-gray-800 shadow-lg animate-fade-in-up'> */}
			<MessageInput
				msgLen={messages.length}
				inputText={inputText}
				setInputText={setInputText}
				handleSubmit={handleSubmit}
				isPending={generateResponseMutation.isPending}
			/>
			{/* </div> */}
		</div>
	);
};

export default memo(ChatInterface);
