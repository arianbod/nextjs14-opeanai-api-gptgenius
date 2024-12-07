import React, { memo, useEffect, useRef, useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import AILoadingIndicator from './AILoadingIndicator';
import { useChat } from '@/context/ChatContext';
import Header from './Header';
import toast from 'react-hot-toast';
import Loading from '../Loading';

const ChatInterface = () => {
	const { messages, isGenerating, generateResponse, model } = useChat();
	const [inputText, setInputText] = useState('');
	const messagesEndRef = useRef(null);
	const [greetingIndex, setGreetingIndex] = useState(0);
	const [showGreeting, setShowGreeting] = useState(true);

	const standardGreetings = [
		'How can I assist you today?',
		"Ready to chat! What's on your mind?",
		"Let's explore some ideas together!",
		"I'm here to help. What would you like to know?",
		'Excited to learn from you. What shall we discuss?',
	];

	const perplexityQuestions = [
		[
			'Tell me about recent developments in AI technology',
			'What are the key challenges in quantum computing?',
			'How is climate change affecting global weather patterns?',
		],
		[
			"What's the future of renewable energy?",
			'How does blockchain technology work?',
			'What are the latest breakthroughs in medicine?',
		],
		[
			'Explain the impact of social media on society',
			'What are the trends in remote work?',
			'How is space exploration advancing?',
		],
	];

	const greetings =
		model.provider === 'perplexity' ? perplexityQuestions : standardGreetings;

	useEffect(() => {
		const interval = setInterval(() => {
			setShowGreeting(false);
			setTimeout(() => {
				setGreetingIndex((prevIndex) => (prevIndex + 1) % greetings.length);
				setShowGreeting(true);
			}, 300);
		}, 5000);
		return () => clearInterval(interval);
	}, [greetings.length]);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		if (messages.length > 0) {
			scrollToBottom();
		}
	}, [messages]);

	const handleSubmit = async (e) => {
		e.preventDefault();
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

	const handleQuestionClick = (question) => {
		setInputText(question);
	};

	const renderGreeting = () => {
		if (model.provider === 'perplexity') {
			return (
				<div className='flex flex-col space-y-4'>
					<h2 className='text-xl font-semibold text-center mb-4'>
						Explore these topics:
					</h2>
					{greetings[greetingIndex].map((question, idx) => (
						<button
							key={idx}
							onClick={() => handleQuestionClick(question)}
							className='text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200'>
							{question}
						</button>
					))}
				</div>
			);
		}
		return (
			<h2 className='text-2xl font-bold text-center px-4'>
				{greetings[greetingIndex]}
			</h2>
		);
	};

	return (
		<div className='w-full max-w-3xl mx-auto rounded-xl no-scrollbar min-h-screen'>
			<div className='relative flex flex-col transition-colors duration-300'>
				<Header msgLen={messages.length} />
				{messages.length > 0 ? (
					<div className='flex-grow animate-fade-in-down'>
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
						<div
							className={`transition-opacity duration-300 ${
								showGreeting ? 'opacity-100' : 'opacity-0'
							}`}>
							{isGenerating ? (
								<div className='mx-4 my-2'>
									<AILoadingIndicator />
								</div>
							) : (
								renderGreeting()
							)}
						</div>
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
		</div>
	);
};

export default memo(ChatInterface);
