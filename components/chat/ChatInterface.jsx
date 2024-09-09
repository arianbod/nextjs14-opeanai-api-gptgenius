import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { nanoid } from 'nanoid';
import toast from 'react-hot-toast';
import { generateChatResponse } from '@/utils/action';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useUser } from '@clerk/nextjs';
import AILoadingIndicator from './AILoadingIndicator';

const ChatInterface = ({ persona }) => {
	const { user } = useUser();
	const [messages, setMessages] = useState([]);
	const [inputText, setInputText] = useState('');
	const messagesEndRef = useRef(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(scrollToBottom, [messages]);

	useEffect(() => {
		setMessages([
			{
				id: nanoid(),
				role: 'assistant',
				content: `Hello! I'm ${persona.name}, your ${persona.role}. How can I assist you today?`,
			},
		]);
	}, [persona]);

	const chatMutation = useMutation({
		mutationFn: async (content) => {
			if (!user) throw new Error('User not authenticated');
			const response = await generateChatResponse(
				JSON.stringify([...messages, { role: 'user', content }]),
				user.id,
				JSON.stringify(persona)
			);
			return response;
		},
		onSuccess: (data) => {
			if (data.message) {
				setMessages((prev) => [
					...prev,
					{ id: nanoid(), role: 'assistant', content: data.message.content },
				]);
			} else if (data.error) {
				toast.error(data.error);
			}
		},
		onError: (error) => toast.error(error.message),
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!inputText.trim()) return;
		const newMessage = { id: nanoid(), role: 'user', content: inputText };
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
