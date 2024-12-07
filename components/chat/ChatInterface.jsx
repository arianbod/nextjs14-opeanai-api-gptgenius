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

	// Categories of questions to help users understand the AI's capabilities
	const perplexityQuestions = [
		// Everyday Questions
		[
			"What's the best recipe for chocolate chip cookies?",
			'How can I improve my productivity while working from home?',
			'What are some easy exercises for beginners?',
		],
		// Educational & Research
		[
			'Explain quantum computing in simple terms',
			'Compare and contrast renewable energy sources',
			'What caused the fall of the Roman Empire?',
		],
		// Problem Solving
		[
			'Debug this code: function sum(a,b) { retur a + b }',
			'How do I fix a leaking faucet?',
			"What's the best way to remove coffee stains?",
		],
		// Current Events & Analysis
		[
			'What are the latest developments in AI technology?',
			'How is climate change affecting agriculture?',
			'Analyze the impact of remote work on cities',
		],
		// Creative & Writing
		[
			'Write a short story about a time traveler',
			'Help me draft a professional email to my boss',
			'Generate a marketing tagline for an eco-friendly product',
		],
		// Math & Science
		[
			'Solve this equation: 3x² + 6x - 24 = 0',
			'Explain how vaccines work',
			'Calculate the compound interest on $1000 at 5% for 3 years',
		],
		// Life Advice
		[
			'What are some tips for improving sleep quality?',
			'How can I start investing with a small budget?',
			'Suggest some healthy meal prep ideas',
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
			const currentQuestions = greetings[greetingIndex];
			const categoryTitles = [
				'Everyday Questions',
				'Educational & Research',
				'Problem Solving',
				'Current Events & Analysis',
				'Creative & Writing',
				'Math & Science',
				'Life Advice',
			];

			return (
				<div className='flex flex-col space-y-6 w-full max-w-xl mx-auto px-4'>
					<div className='text-center space-y-2'>
						<h2 className='text-xl font-semibold'>Try asking me:</h2>
						<p className='text-sm text-gray-600 dark:text-gray-400'>
							Click any question or type your own. I can handle follow-up
							questions too!
						</p>
					</div>

					<div className='space-y-4'>
						<h3 className='text-md font-medium text-gray-700 dark:text-gray-300'>
							{categoryTitles[greetingIndex]}:
						</h3>
						{currentQuestions.map((question, idx) => (
							<button
								key={idx}
								onClick={() => handleQuestionClick(question)}
								className='w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'>
								<span className='flex items-center'>
									<span className='mr-2 text-gray-400'>→</span>
									{question}
								</span>
							</button>
						))}
					</div>

					<div className='text-center text-sm text-gray-500 dark:text-gray-400'>
						Pro tip: You can ask follow-up questions or request more details
						about any topic!
					</div>
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
