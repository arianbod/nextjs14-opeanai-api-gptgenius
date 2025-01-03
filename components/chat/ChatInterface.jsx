import React, { memo, useEffect, useRef, useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import AILoadingIndicator from './AILoadingIndicator';
import { useChat } from '@/context/ChatContext';
import Header from './Header';
import toast from 'react-hot-toast';
import { FaSearch, FaRegLightbulb } from 'react-icons/fa';
import { ArrowUp } from 'lucide-react';
import { useTranslations } from '@/context/TranslationContext';
import { usePreferences } from '@/context/preferencesContext';

const IMAGE_TYPES = [
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
	'image/svg+xml',
];
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
	const { dict, t } = useTranslations();
	const { showSidebar } = usePreferences();
	// Greetings and suggestions configuration
	const standardGreetings = [
		{
			title: t('chatInterface.greetings.askAnythingTitle'),
			subtitle: t('chatInterface.greetings.askAnythingSubtitle'),
		},
		{
			title: t('chatInterface.greetings.sparkCreativityTitle'),
			subtitle: t('chatInterface.greetings.sparkCreativitySubtitle'),
		},
		{
			title: t('chatInterface.greetings.researchExplainTitle'),
			subtitle: t('chatInterface.greetings.researchExplainSubtitle'),
		},
		{
			title: t('chatInterface.greetings.getInsightsTitle'),
			subtitle: t('chatInterface.greetings.getInsightsSubtitle'),
		},
		{
			title: t('chatInterface.greetings.boostProductivityTitle'),
			subtitle: t('chatInterface.greetings.boostProductivitySubtitle'),
		},
	];

	const standardSuggestions = [
		t('chatInterface.suggestions.machineLearning'),
		t('chatInterface.suggestions.writeEmail'),
		t('chatInterface.suggestions.timeManagement'),
	];

	const perplexityQuestions = [
		[
			t('chatInterface.perplexityQuestions.weatherNY'),
			t('chatInterface.perplexityQuestions.restaurantsDubai'),
			t('chatInterface.perplexityQuestions.getToTimesSquare'),
		],
		[
			t('chatInterface.perplexityQuestions.resetIphone'),
			t('chatInterface.perplexityQuestions.easyChickenRecipes'),
			t('chatInterface.perplexityQuestions.loseBellyFat'),
		],
		[
			t('chatInterface.perplexityQuestions.iphoneVsSamsung'),
			t('chatInterface.perplexityQuestions.bestWashingMachine'),
			t('chatInterface.perplexityQuestions.amazonPrimeDeals'),
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
				reject(new Error(t('chatInterface.errors.failedToLoadImage')));
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
			toast.error(t('chatInterface.errors.fileSizeExceeded'));
			return;
		}

		const allowedTypes = {
			// Documents
			'text/plain': t('chatInterface.fileTypes.TXT'),
			'application/pdf': t('chatInterface.fileTypes.PDF'),
			'application/msword': t('chatInterface.fileTypes.DOC'),
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
				t('chatInterface.fileTypes.DOCX'),
			'text/csv': t('chatInterface.fileTypes.CSV'),
			'application/vnd.ms-excel': t('chatInterface.fileTypes.XLS'),
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': t(
				'chatInterface.fileTypes.XLSX'
			),
			// Images
			'image/jpeg': t('chatInterface.fileTypes.JPEG'),
			'image/png': t('chatInterface.fileTypes.PNG'),
			'image/gif': t('chatInterface.fileTypes.GIF'),
			'image/webp': t('chatInterface.fileTypes.WEBP'),
			'image/svg+xml': t('chatInterface.fileTypes.SVG'),
			// Web files
			'text/html': t('chatInterface.fileTypes.HTML'),
			'text/css': t('chatInterface.fileTypes.CSS'),
			'application/javascript': t('chatInterface.fileTypes.JS'),
			'application/json': t('chatInterface.fileTypes.JSON'),
			'text/markdown': t('chatInterface.fileTypes.MD'),
		};

		const fileExtension = file.name.split('.').pop().toLowerCase();
		const mimeType = file.type.toLowerCase();

		if (
			!allowedTypes[mimeType] &&
			!Object.values(allowedTypes).includes(fileExtension.toUpperCase())
		) {
			toast.error(
				`${t('chatInterface.errors.unsupportedFileType')} ${Object.values(
					allowedTypes
				)
					.map((type) => type.toUpperCase())
					.join(', ')}`
			);
			return;
		}

		try {
			setIsUploading(true);
			setUploadProgress(0);
			abortControllerRef.current = new AbortController();

			// Additional image validation for Claude's requirements
			// if (IMAGE_TYPES.includes(mimeType)) {
			//     const dimensions = await validateImageDimensions(file);

			//     if (dimensions.width > 1568 || dimensions.height > 1568) {
			//         toast.error(t('chatInterface.errors.imageDimensionsExceeded'));
			//         setIsUploading(false);
			//         return;
			//     }

			//     if (dimensions.megapixels > 1.15) {
			//         toast.error(t('chatInterface.errors.imageMegapixelsExceeded'));
			//         setIsUploading(false);
			//         return;
			//     }
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
				reader.onerror = () =>
					reject(new Error(t('chatInterface.errors.failedToReadFile')));

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
			toast.success(t('chatInterface.uploadSuccess', { fileName: file.name }));
		} catch (error) {
			if (abortControllerRef.current) {
				console.log(t('chatInterface.errors.uploadCanceled'));
			} else {
				console.error(t('chatInterface.errors.fileProcessingError'), error);
				toast.error(t('chatInterface.errors.fileProcessingError'));
			}
			setIsUploading(false);
			setUploadProgress(0);
			setUploadedFile(null);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!inputText.trim() && !uploadedFile) {
			toast.error(t('chatInterface.errors.enterMessageOrFile'));
			return;
		}

		if (!model) {
			toast.error(t('chatInterface.errors.selectModelFirst'));
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
			toast.success(t('chatInterface.messageSent'));
		} catch (error) {
			console.error(t('chatInterface.errors.sendMessageError'), error);
			toast.error(t('chatInterface.errors.sendMessageError'));
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
					{t('chatInterface.postSelectionHint.greatChoice')}
				</h2>
				<p className='text-sm text-gray-600 dark:text-gray-300 mb-3'>
					{t('chatInterface.postSelectionHint.youSelected')}{' '}
					<span className='font-medium text-gray-700 dark:text-gray-300'>
						{chosenText}
					</span>
				</p>
				<div className='text-sm text-gray-600 dark:text-gray-300 flex flex-wrap justify-center items-center gap-2'>
					{t('chatInterface.postSelectionHint.refineRequest')}
					<div className='p-2 text-gray-400 hover:text-white rounded-full bg-base-200'>
						<ArrowUp className='w-6 h-6' />
					</div>
					{t('chatInterface.postSelectionHint.sendIcon')}
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
						{t('chatInterface.perplexityGreeting.needInspiration')}{' '}
						<FaSearch className='inline-block ml-1 text-blue-500' />
					</h2>
					<p className='text-sm text-gray-600 dark:text-gray-400'>
						{t('chatInterface.perplexityGreeting.clickExample')}
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
					{t('chatInterface.perplexityGreeting.followUp')}
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
						{t('chatInterface.standardGreeting.needIdeas')}
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
					{t('chatInterface.standardGreeting.ready')}
				</div>
			</div>
		);
	};

	const cancelUpload = () => {
		if (abortControllerRef.current) {
			setIsUploading(false);
			setUploadProgress(0);
			setUploadedFile(null);
			toast.error(t('chatInterface.errors.uploadCanceled'));
			abortControllerRef.current = null;
		}
	};

	const removeFile = () => {
		setUploadedFile(null);
		setUploadProgress(0);
		setIsUploading(false);
		toast.success(t('chatInterface.errors.fileRemoved'));
	};

	return (
		<div className=' w-full max-w-3xl mx-auto rounded-xl no-scrollbar min-h-screen relative'>
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
				<div
					className={`
						fixed bottom-0 left-0 right-0 mx-auto 
					${showSidebar ? '' : ''}
					`}>
					<MessageInput
						msgLen={messages.length}
						inputText={inputText}
						setInputText={setInputText}
						handleSubmit={handleSubmit}
						isPending={isGenerating || isUploading}
						disabled={!model || isGenerating || isUploading}
						modelName={model?.name || t('chatInterface.defaultModelName')}
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
