import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { nanoid } from 'nanoid';
import { toast } from 'react-hot-toast';
import { generateChatResponse, addMessageToChat } from '@/server/chat';
import { fetchPerplexity } from '@/server/perplexity';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import AILoadingIndicator from './AILoadingIndicator';

const ChatInterface = ({
	clerkId,
	persona,
	chatId,
	initialMessages,
	isPerplexity,
}) => {
	const [messages, setMessages] = useState(initialMessages || []);
	const [inputText, setInputText] = useState('');
	const messagesEndRef = useRef(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(scrollToBottom, [messages]);

	const chatMutation = useMutation({
		mutationFn: async (content) => {
			if (!clerkId) throw new Error('User not authenticated');

			// Add user message to the database
			await addMessageToChat(clerkId, chatId, content, 'user');

			if (isPerplexity) {
				const response = await fetchPerplexity(content);
				return { message: { content: response } };
			} else {
				const response = await generateChatResponse(
					clerkId,
					JSON.stringify([...messages, { role: 'user', content }]),
					JSON.stringify(persona),
					chatId
				);
				return response;
			}
		},
		onSuccess: (data) => {
			if (data.message) {
				const newMessage = {
					id: nanoid(),
					role: 'assistant',
					content: data.message.content,
					timestamp: new Date().toISOString(),
				};
				setMessages((prev) => [...prev, newMessage]);
			} else if (data.error) {
				toast.error(data.error);
			}
		},
		onError: (error) => {
			console.error('Error in chat mutation:', error);
			toast.error('Failed to send message. Please try again.');
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!inputText.trim()) return;
		const newMessage = {
			id: nanoid(),
			role: 'user',
			content: inputText,
			timestamp: new Date().toISOString(),
		};
		setMessages((prev) => [...prev, newMessage]);
		chatMutation.mutate(inputText);
		setInputText('');
	};

	return (
		<>
			<MessageList
				messages={messages}
				isLoading={chatMutation.isPending}
				messagesEndRef={messagesEndRef}
			/>
			{chatMutation.isPending && (
				<div className='mx-4 my-2'>
					<AILoadingIndicator />
				</div>
			)}
			<MessageInput
				inputText={inputText}
				setInputText={setInputText}
				handleSubmit={handleSubmit}
				isPending={chatMutation.isPending}
			/>
		</>
	);
};

export default ChatInterface;
