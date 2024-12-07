'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import AILoadingIndicator from './AILoadingIndicator';
import { useChat } from '@/context/ChatContext';
import Header from './Header';
import toast from 'react-hot-toast';
import {
	FaLightbulb,
	FaSearch,
	FaRegLightbulb,
	FaPaperPlane,
} from 'react-icons/fa';
import { ArrowUp } from 'lucide-react';

const ChatInterface = () => {
	const { messages, isGenerating, generateResponse, model } = useChat();
	const [inputText, setInputText] = useState('');
	const messagesEndRef = useRef(null);
	const [greetingIndex, setGreetingIndex] = useState(0);
	const [showGreeting, setShowGreeting] = useState(true);
	const [selectedSuggestion, setSelectedSuggestion] = useState(null);

	// General greetings
	const standardGreetings = [
		{
			title: '👋 Ask me anything!',
			subtitle: "From quick queries to deep dives, I'm here for you.",
		},
		{
			title: '💡 Spark Creativity',
			subtitle: "Need fresh ideas? Let's brainstorm and innovate.",
		},
		{
			title: '📚 Research & Explain',
			subtitle: 'From summaries to detailed explanations, just ask away.',
		},
		{
			title: '🔍 Get Specific Insights',
			subtitle: 'Break down tough topics step-by-step to understand better.',
		},
		{
			title: '💪 Boost Productivity',
			subtitle: "From writing drafts to coding tips—let's get it done.",
		},
	];

	// Example questions for all models except Perplexity
	const standardSuggestions = [
		'Explain the difference between machine learning and deep learning',
		'Help me write a short email to my team about project updates',
		'Give me some tips for improving my time management skills',
	];

	// Categories and questions if model is Perplexity
	const perplexityQuestions = [
		[
			'weather new york next 5 days in centigrade',
			'best restaurants near antalya, turkey open now',
			'how to get to times square from jfk',
		],
		[
			'how to reset iphone without password',
			'easy chicken recipes for dinner tonight',
			'fastest way to lose belly fat at home',
		],
		[
			'iphone 15 vs samsung s24 which is better',
			'best washing machine under 500',
			'amazon prime day 2024 deals',
		],
		[
			'why do I have a headache when I wake up',
			'how to get rid of cold fast natural remedies',
			'is it normal to feel tired all the time',
		],
		[
			'netflix not working on smart tv how to fix',
			'how to remove virus from laptop windows 11',
			'forgot gmail password recovery steps',
		],
		[
			'cheap flights to europe summer 2024',
			'things to do in paris with kids',
			'taylor swift eras tour tickets resale',
		],
		[
			'who won the world cup 2006',
			'game of thrones spin off release date',
			'tesla new model price and features',
		],
		[
			'how much should i save each month calculator',
			'what jobs can i do from home with no experience',
			'best time to buy house 2024',
		],
	];

	const greetings =
		!model || !model.showOnModelSelection
			? standardGreetings
			: model.provider === 'perplexity'
			? perplexityQuestions
			: standardGreetings;

	useEffect(() => {
		const interval = setInterval(() => {
			if (!selectedSuggestion) {
				setShowGreeting(false);
				setTimeout(() => {
					setGreetingIndex((prevIndex) => (prevIndex + 1) % greetings.length);
					setShowGreeting(true);
				}, 300);
			}
		}, 5000);
		return () => clearInterval(interval);
	}, [greetings.length, selectedSuggestion]);

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
			setSelectedSuggestion(null); // Reset suggestion hint once user sends a message
		} catch (error) {
			console.error('Error sending message:', error);
			toast.error('Failed to send message');
		}
	};

	const handleQuestionClick = (question) => {
		setInputText(question);
		setSelectedSuggestion(question);
	};

	const categoryTitles = [
		'Common Searches',
		'How-to & DIY',
		'Shopping & Reviews',
		'Health & Symptoms',
		'Tech Help',
		'Travel & Events',
		'Trending & News',
		'Life Questions',
	];

	const renderPostSelectionHint = (chosenText) => (
		<div className='flex flex-col space-y-6 w-full max-w-xl mx-auto px-4 pt-64 text-center'>
			<div className='p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg'>
				<h2 className='text-2xl font-bold text-gray-800 dark:text-gray-50 mb-3'>
					Great Choice! 🎉
				</h2>
				<p className='text-sm text-gray-600 dark:text-gray-300 mb-3'>
					You selected:{' '}
					<span className='font-medium text-gray-700 dark:text-gray-300'>
						{chosenText}
					</span>
				</p>
				<div className='text-sm text-gray-600 dark:text-gray-300 flex flex-wrap'>
					Now, feel free to refine your request in the text box below and press
					
					the{' '}
					<div className='p-2 text-gray-400 hover:text-white rounded-full disabled:opacity-70 bg-base-200 disabled:bg-base-200/50 transition-all duration-200 '>
						<ArrowUp className='w-6 h-6' />
					</div>
					icon to send it!
				</div>
			</div>
		</div>
	);

	const renderPerplexityGreeting = () => {
		if (selectedSuggestion) {
			return renderPostSelectionHint(selectedSuggestion);
		}

		const currentQuestions = greetings[greetingIndex];

		return (
			<div className='flex flex-col space-y-6 w-full max-w-xl mx-auto px-4 pt-64'>
				<div className='text-center space-y-2'>
					<h2 className='text-2xl font-bold text-gray-800 dark:text-gray-100'>
						Need Inspiration?{' '}
						<FaSearch className='inline-block ml-1 text-blue-500' />
					</h2>
					<p className='text-sm text-gray-600 dark:text-gray-400'>
						Click any example or type your own question!
					</p>
				</div>

				<div className='space-y-4'>
					<h3 className='text-md font-semibold text-gray-700 dark:text-gray-300'>
						{categoryTitles[greetingIndex]}:
					</h3>
					<div className='space-y-2'>
						{currentQuestions.map((question, idx) => (
							<button
								key={idx}
								onClick={() => handleQuestionClick(question)}
								className='w-full text-left px-4 py-3 rounded-lg bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-600 shadow-sm'>
								<span className='flex items-center text-gray-700 dark:text-gray-300'>
									<FaRegLightbulb className='mr-2 text-yellow-500' />
									{question}
								</span>
							</button>
						))}
					</div>
				</div>

				<div className='text-center text-sm text-gray-500 dark:text-gray-400'>
					You can ask follow-up questions or refine your prompt at any time!
				</div>
			</div>
		);
	};

	const renderStandardGreeting = () => {
		if (selectedSuggestion) {
			return renderPostSelectionHint(selectedSuggestion);
		}

		const currentGreeting = greetings[greetingIndex];

		return (
			<div className='flex flex-col items-center justify-center space-y-6 text-center px-4 max-w-xl mx-auto pt-64'>
				<div className='space-y-4'>
					<h2 className='text-2xl font-bold text-gray-800 dark:text-gray-50'>
						{currentGreeting.title}
					</h2>
					<p className='text-gray-600 dark:text-gray-300 text-base'>
						{currentGreeting.subtitle}
					</p>
				</div>

				<div className='space-y-2 w-full'>
					<p className='text-sm text-gray-600 dark:text-gray-400'>
						Need some ideas? Try one of these:
					</p>
					{standardSuggestions.map((suggestion, idx) => (
						<button
							key={idx}
							onClick={() => handleQuestionClick(suggestion)}
							className='w-full text-left px-4 py-3 rounded-lg bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-600 shadow-sm'>
							<span className='flex items-center text-gray-700 dark:text-gray-300'>
								<FaRegLightbulb className='mr-2 text-yellow-500' />
								{suggestion}
							</span>
						</button>
					))}
				</div>

				<div className='mt-4 text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2'>
					<span className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></span>
					Ready when you are!
				</div>
			</div>
		);
	};

	const renderGreeting = () => {
		if (model?.provider === 'perplexity') {
			return renderPerplexityGreeting();
		} else {
			return renderStandardGreeting();
		}
	};

	return (
		<div className='w-full max-w-3xl mx-auto rounded-xl no-scrollbar min-h-screen relative'>
			<div className='absolute inset-0 bg-gradient-to-br from-gray-100 to-blue-50 dark:from-gray-900 dark:to-gray-800 -z-10'></div>
			<div className='relative flex flex-col transition-colors duration-300 min-h-screen'>
				<Header msgLen={messages.length} />
				{messages.length > 0 ? (
					<div className='flex-grow animate-fade-in-down px-4 pb-20'>
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
					<div className='h-[40vh] w-full flex items-center justify-center'>
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
				<div className='sticky bottom-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700'>
					<MessageInput
						msgLen={messages.length}
						inputText={inputText}
						setInputText={setInputText}
						handleSubmit={handleSubmit}
						isPending={isGenerating}
						disabled={!model || isGenerating}
						modelName={model?.name || 'AI'} // Pass the model name down
					/>
				</div>
			</div>
		</div>
	);
};

export default memo(ChatInterface);
