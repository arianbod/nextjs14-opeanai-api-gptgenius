import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { nanoid } from 'nanoid';
import { toast } from 'react-hot-toast';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import AILoadingIndicator from './AILoadingIndicator';
import { useMessages } from '@/context/MessageContext';

const ChatInterface = ({ persona }) => {
	const { messages, addMessage, updateMessage, removeMessage } = useMessages();
	const [inputText, setInputText] = useState('');
	const messagesEndRef = useRef(null);
	const queryClient = useQueryClient();

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(scrollToBottom, [messages]);

const generateResponseMutation = useMutation({
	mutationFn: async (content) => {
		const response = await fetch('/api/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				messages: messages.map(({ role, content }) => ({ role, content })),
				persona,
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

	const handleSubmit = (e) => {
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
			<MessageInput
				inputText={inputText}
				setInputText={setInputText}
				handleSubmit={handleSubmit}
				isPending={generateResponseMutation.isPending}
			/>
		</>
	);
};

export default ChatInterface;
