import React from 'react';
import {
	Image as ImageIcon,
	Loader2,
	AlertCircle,
	Download,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ImageGenerationDisplay = ({
	imageUrl,
	isLoading,
	error,
	prompt,
	onRetry,
	onDownload = (url) => {
		const link = document.createElement('a');
		link.href = url;
		link.download = `generated-image-${Date.now()}.png`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	},
}) => {
	if (isLoading) {
		return (
			<div className='flex flex-col items-center justify-center space-y-4 p-8 bg-gray-50 dark:bg-gray-800 rounded-lg'>
				<Loader2 className='h-8 w-8 animate-spin text-blue-500' />
				<p className='text-sm text-gray-500 dark:text-gray-400'>
					Generating your image...
				</p>
				{prompt && (
					<p className='text-xs text-gray-400 dark:text-gray-500 text-center max-w-sm'>
						"{prompt}"
					</p>
				)}
			</div>
		);
	}

	if (error) {
		return (
			<Alert
				variant='destructive'
				className='mb-4'>
				<AlertCircle className='h-4 w-4' />
				<AlertDescription className='flex items-center justify-between'>
					<span>{error}</span>
					{onRetry && (
						<button
							onClick={onRetry}
							className='ml-4 text-sm underline hover:text-gray-200 transition-colors'>
							Try again
						</button>
					)}
				</AlertDescription>
			</Alert>
		);
	}

	if (imageUrl) {
		return (
			<div className='relative group max-w-2xl mx-auto'>
				<div className='aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800'>
					<img
						src={imageUrl}
						alt={prompt || 'Generated image'}
						className='object-cover w-full h-full rounded-lg shadow-lg'
						loading='lazy'
					/>
					<div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
						<button
							onClick={() => onDownload(imageUrl)}
							className='p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors'
							title='Download image'>
							<Download className='h-5 w-5' />
						</button>
					</div>
				</div>
				{prompt && (
					<div className='mt-2 text-sm text-gray-500 dark:text-gray-400 text-center'>
						<p className='font-medium'>Prompt:</p>
						<p className='italic'>"{prompt}"</p>
					</div>
				)}
			</div>
		);
	}

	return null;
};

export default ImageGenerationDisplay;
