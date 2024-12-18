import React, { memo, useEffect, useRef, useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import AILoadingIndicator from './AILoadingIndicator';
import { useChat } from '@/context/ChatContext';
import Header from './Header';
import toast from 'react-hot-toast';
import { FaSearch, FaRegLightbulb } from 'react-icons/fa';
import { ArrowUp } from 'lucide-react';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const ChatInterface = () => {
	const { messages, isGenerating, generateResponse, model } = useChat();
	const [inputText, setInputText] = useState('');
	const [uploadedFile, setUploadedFile] = useState(null);
	const messagesEndRef = useRef(null);
	const [greetingIndex, setGreetingIndex] = useState(0);
	const [showGreeting, setShowGreeting] = useState(true);
	const [selectedSuggestion, setSelectedSuggestion] = useState(null);

	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const abortControllerRef = useRef(null);

	// Greetings and suggestions configuration
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

	const standardSuggestions = [
		'Explain the difference between machine learning and deep learning',
		'Help me write a short email to my team about project updates',
		'Give me some tips for improving my time management skills',
	];

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
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
		}
	};

	useEffect(() => {
		if (messages.length > 0) {
			scrollToBottom();
		}
	}, [messages]);

	const validateImageDimensions = async (file) => {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				URL.revokeObjectURL(img.src);
				const dimensions = {
					width: img.width,
					height: img.height,
					megapixels: (img.width * img.height) / 1000000,
				};
				resolve(dimensions);
			};
			img.onerror = () => {
				URL.revokeObjectURL(img.src);
				reject(new Error('Failed to load image'));
			};
			img.src = URL.createObjectURL(file);
		});
	};

	const handleFileUpload = async (file) => {
		if (!file) {
			setUploadedFile(null);
			return;
		}

		if (file.size > MAX_FILE_SIZE) {
			toast.error('File size should be less than 20MB');
			return;
		}

		const allowedTypes = {
			// Documents
			'text/plain': 'TXT',
			'application/pdf': 'PDF',
			'application/msword': 'DOC',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
				'DOCX',
			'text/csv': 'CSV',
			'application/vnd.ms-excel': 'XLS',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
				'XLSX',
			// Images
			'image/jpeg': 'JPEG',
			'image/png': 'PNG',
			'image/gif': 'GIF',
			'image/webp': 'WEBP',
			'image/svg+xml': 'SVG',
			// Web files
			'text/html': 'HTML',
			'text/css': 'CSS',
			'application/javascript': 'JS',
			'application/json': 'JSON',
			'text/markdown': 'MD',
		};

		const fileExtension = file.name.split('.').pop().toLowerCase();
		const mimeType = file.type.toLowerCase();

		if (
			!allowedTypes[mimeType] &&
			!Object.values(allowedTypes).includes(fileExtension.toUpperCase())
		) {
			toast.error(
				`Unsupported file type. Allowed types: ${[
					...new Set(Object.values(allowedTypes)),
				].join(', ')}`
			);
			return;
		}

		try {
			setIsUploading(true);
			setUploadProgress(0);
			abortControllerRef.current = new AbortController();

			// Additional image validation for Claude's requirements
			// if (IMAGE_TYPES.includes(mimeType)) {
			// 	const dimensions = await validateImageDimensions(file);

			// 	if (dimensions.width > 1568 || dimensions.height > 1568) {
			// 		toast.error('Image dimensions should not exceed 1568x1568 pixels');
			// 		setIsUploading(false);
			// 		return;
			// 	}

			// 	if (dimensions.megapixels > 1.15) {
			// 		toast.error(
			// 			'Image size should not exceed 1.15 megapixels for optimal performance'
			// 		);
			// 		setIsUploading(false);
			// 		return;
			// 	}
			// }

			const reader = new FileReader();

			reader.onprogress = (event) => {
				if (event.lengthComputable) {
					const progress = (event.loaded / event.total) * 100;
					setUploadProgress(progress);
				}
			};

			const fileContent = await new Promise((resolve, reject) => {
				reader.onloadend = () => resolve(reader.result);
				reader.onerror = () => reject(new Error('Failed to read file'));

				if (
					mimeType.startsWith('text/') ||
					mimeType.includes('javascript') ||
					mimeType.includes('json') ||
					mimeType.includes('xml')
				) {
					reader.readAsText(file);
				} else {
					reader.readAsDataURL(file);
				}
			});

			setUploadedFile({
				name: file.name,
				type: file.type,
				size: file.size,
				content: fileContent.split(',')[1] || fileContent,
				extension: file.name.split('.').pop().toLowerCase(),
				isText:
					mimeType.startsWith('text/') ||
					mimeType.includes('javascript') ||
					mimeType.includes('json') ||
					mimeType.includes('xml'),
			});

			setIsUploading(false);
			setUploadProgress(100);
			toast.success(`${file.name} uploaded successfully!`);
		} catch (error) {
			if (abortControllerRef.current) {
				console.log('Upload aborted');
			} else {
				console.error('Error processing file:', error);
				toast.error('Error processing file. Please try again.');
			}
			setIsUploading(false);
			setUploadProgress(0);
			setUploadedFile(null);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!inputText.trim() && !uploadedFile) {
			toast.error('Please enter a message or upload a file');
			return;
		}

		if (!model) {
			toast.error('Please select a model first');
			return;
		}

		const messageContent = inputText.trim();
		setInputText('');

		try {
			let fileData = null;
			if (uploadedFile) {
				fileData = {
					name: uploadedFile.name,
					type: uploadedFile.type,
					content: uploadedFile.content,
				};
			}

			await generateResponse(messageContent, fileData);
			setSelectedSuggestion(null);
			setUploadedFile(null);
			setUploadProgress(0);
			toast.success('Message sent successfully!');
		} catch (error) {
			console.error('Error sending message:', error);
			toast.error('Failed to send message');
		}
	};

	const handleQuestionClick = (question) => {
		setInputText(question);
		setSelectedSuggestion(question);
	};

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
				<div className='text-sm text-gray-600 dark:text-gray-300 flex flex-wrap justify-center items-center gap-2'>
					Now, feel free to refine your request in the text box below and press
					the{' '}
					<div className='p-2 text-gray-400 hover:text-white rounded-full bg-base-200'>
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

	const cancelUpload = () => {
		if (abortControllerRef.current) {
			setIsUploading(false);
			setUploadProgress(0);
			setUploadedFile(null);
			toast.error('File upload canceled.');
			abortControllerRef.current = null;
		}
	};

	const removeFile = () => {
		setUploadedFile(null);
		setUploadProgress(0);
		setIsUploading(false);
		toast.success('File removed.');
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
							isLoading={isGenerating || isUploading}
							messagesEndRef={messagesEndRef}
						/>
						{(isGenerating || isUploading) && (
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
							{isGenerating || isUploading ? (
								<div className='mx-4 my-2'>
									<AILoadingIndicator />
								</div>
							) : model?.provider === 'perplexity' ? (
								renderPerplexityGreeting()
							) : (
								renderStandardGreeting()
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
						isPending={isGenerating || isUploading}
						disabled={!model || isGenerating || isUploading}
						modelName={model?.name || 'AI'}
						onFileUpload={handleFileUpload}
						uploadProgress={uploadProgress}
						isUploading={isUploading}
						uploadedFile={uploadedFile}
						onCancelUpload={cancelUpload}
						onRemoveFile={removeFile}
					/>
				</div>
			</div>
		</div>
	);
};

export default memo(ChatInterface);