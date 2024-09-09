// ImageGenerationInterface.js
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { generateImage } from '@/utils/action';

const ImageGenerationInterface = ({ userId }) => {
	const [inputText, setInputText] = useState('');
	const [generatedImage, setGeneratedImage] = useState(null);

	const imageMutation = useMutation({
		mutationFn: (prompt) => generateImage(prompt, userId),
		onSuccess: (data) => {
			if (data.imageUrl) {
				setGeneratedImage(data.imageUrl);
			} else if (data.error) {
				toast.error(data.error);
			}
		},
		onError: (error) => toast.error(error.message),
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!inputText.trim()) return;
		imageMutation.mutate(inputText);
	};

	return (
		<div className='flex-1 overflow-y-auto p-4 bg-base-200'>
			<div className='max-w-2xl mx-auto space-y-6'>
				<form
					onSubmit={handleSubmit}
					className='space-y-4'>
					<input
						type='text'
						value={inputText}
						onChange={(e) => setInputText(e.target.value)}
						placeholder='Describe the image you want to generate...'
						className='input input-bordered w-full'
					/>
					<button
						type='submit'
						className='btn btn-primary btn-block'
						disabled={imageMutation.isPending}>
						{imageMutation.isPending ? 'Generating...' : 'Generate Image'}
					</button>
				</form>
				{imageMutation.isPending && (
					<div className='text-center'>
						<div className='loading loading-spinner loading-lg'></div>
						<p className='mt-2 text-base-content'>Generating your image...</p>
					</div>
				)}
				{generatedImage && (
					<div className='mt-6'>
						<h3 className='text-lg font-semibold mb-2 text-base-content'>
							Generated Image:
						</h3>
						<img
							src={generatedImage}
							alt='Generated'
							className='w-full rounded-lg shadow-lg'
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default ImageGenerationInterface;