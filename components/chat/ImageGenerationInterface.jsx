import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { generateImage } from '@/server/chat';
import MessageInput from './MessageInput';

const ImageGenerationInterface = ({ userId, chatId }) => {
	const [generatedImage, setGeneratedImage] = useState(null);
	const [prompt, setPrompt] = useState('');

	const imageMutation = useMutation({
		mutationFn: async (prompt) => {
			if (!userId) throw new Error('User not authenticated');
			return generateImage(userId, prompt, chatId);
		},
		onSuccess: (data) => {
			if (data.imageUrl) {
				setGeneratedImage(data.imageUrl);
			} else if (data.error) {
				toast.error(data.error);
			}
		},
		onError: (error) => {
			console.error('Error generating image:', error);
			toast.error('Failed to generate image. Please try again.');
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!prompt.trim()) return;
		imageMutation.mutate(prompt);
	};

	return (
		<div className='flex flex-col h-full'>
			<div className='flex-grow overflow-auto p-4'>
				{generatedImage && (
					<img
						src={generatedImage}
						alt='Generated'
						className='max-w-full h-auto'
					/>
				)}
			</div>
			<div className='p-4'>
				<MessageInput
					inputText={prompt}
					setInputText={setPrompt}
					handleSubmit={handleSubmit}
					isPending={imageMutation.isPending}
					placeholder='Describe the image you want to generate...'
				/>
			</div>
		</div>
	);
};

export default ImageGenerationInterface;
