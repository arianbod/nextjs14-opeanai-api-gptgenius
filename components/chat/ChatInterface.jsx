import React, { memo, useEffect, useRef, useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import AILoadingIndicator from './AILoadingIndicator';
import { useChat } from '@/context/ChatContext';
import Header from './Header';
import toast from 'react-hot-toast';

const ChatInterface = () => {
	const {
		messages,
		isGenerating,
		generateResponse,
		model,
	} = useChat();

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
			}, 300);
		}, 5000);
		return () => clearInterval(interval);
	}, []);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		if (messages.length > 0) {
			scrollToBottom();
		}
	}, [messages]);

	const handleSubmit = async (e) => {
		e.preventDefault(); // Prevent form submission

		if (!inputText.trim()) return;

		if (!model) {
			toast.error('Please select a model first');
			return;
		}

		const messageContent = inputText.trim();
		setInputText('');

		try {
			await generateResponse(messageContent);
		} catch (error) {
			console.error('Error sending message:', error);
			toast.error('Failed to send message');
		}
	};

	return (
		<div className='flex flex-col max-h-full transition-colors duration-300'>
			<Header msgLen={messages.length} />
			{messages.length > 0 ? (
				<div className='flex-grow overflow-y-auto animate-fade-in-down'>
					<MessageList
						messages={messages}
						isLoading={isGenerating}
						messagesEndRef={messagesEndRef}
					/>
					{isGenerating && (
						<div className='mx-4 my-2'>
							<AILoadingIndicator />
						</div>
					)}
				</div>
			) : (
				<div className='h-[30vh] w-full flex items-center justify-center'>
					<h2
						className={`text-2xl font-bold text-center px-4 transition-opacity duration-300 ${
							showGreeting ? 'opacity-100' : 'opacity-0'
						}`}>
						{greetings[greetingIndex]}
					</h2>
				</div>
			)}
			<MessageInput
				msgLen={messages.length}
				inputText={inputText}
				setInputText={setInputText}
				handleSubmit={handleSubmit}
				isPending={isGenerating}
				disabled={!model || isGenerating}
			/>
		</div>
	);
};

export default memo(ChatInterface);
