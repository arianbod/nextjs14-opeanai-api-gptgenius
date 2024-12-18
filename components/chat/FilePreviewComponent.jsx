'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Loader, Minimize2, Maximize2, X, Paperclip } from 'lucide-react';

const IMAGE_TYPES = [
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
	'image/svg+xml',
];

const FilePreviewComponent = ({ file, onRemove }) => {
	const [previewUrl, setPreviewUrl] = useState('');
	const [expanded, setExpanded] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (file && IMAGE_TYPES.includes(file.type)) {
			const url = `data:${file.type};base64,${file.content}`;
			setPreviewUrl(url);
			return () => URL.revokeObjectURL(url);
		}
	}, [file]);

	if (!file) return null;

	const isImage = IMAGE_TYPES.includes(file.type);

	const previewClass = expanded
		? 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75'
		: 'relative px-4 pt-2 group';

	const imageClass = expanded
		? 'max-w-[90vw] max-h-[90vh] object-contain rounded-lg'
		: 'w-32 h-32 object-cover rounded-lg shadow-lg transition-transform hover:scale-105';

	return (
		<div className={previewClass}>
			<div className='relative'>
				{isImage ? (
					<>
						<img
							src={previewUrl}
							alt='Preview'
							className={`${imageClass} ${
								loading ? 'opacity-0' : 'opacity-100'
							}`}
							onLoad={() => setLoading(false)}
						/>
						{loading && (
							<div className='absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg'>
								<Loader className='w-6 h-6 animate-spin text-blue-400' />
							</div>
						)}
						<div className='absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
							<button
								type='button'
								onClick={() => setExpanded(!expanded)}
								className='p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75'>
								{expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
							</button>
							<button
								type='button'
								onClick={onRemove}
								className='p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75'>
								<X size={16} />
							</button>
						</div>
					</>
				) : (
					<div className='flex items-center gap-3 p-3 bg-gray-800 rounded-lg'>
						<Paperclip className='w-5 h-5 text-gray-400' />
						<div className='flex-1 min-w-0'>
							<p className='text-sm text-gray-200 truncate'>{file.name}</p>
							<p className='text-xs text-gray-400'>
								{(file.size / 1024 / 1024).toFixed(2)} MB
							</p>
						</div>
						<button
							type='button'
							onClick={onRemove}
							className='p-1 text-gray-400 hover:text-white'>
							<X size={16} />
						</button>
					</div>
				)}
			</div>
			{expanded && (
				<button
					type='button'
					onClick={() => setExpanded(false)}
					className='fixed top-4 right-4 p-2 bg-white bg-opacity-10 rounded-full text-white hover:bg-opacity-25'>
					<X className='w-6 h-6' />
				</button>
			)}
		</div>
	);
};

FilePreviewComponent.propTypes = {
	file: PropTypes.shape({
		name: PropTypes.string,
		type: PropTypes.string,
		size: PropTypes.number,
		content: PropTypes.string,
		extension: PropTypes.string,
		isText: PropTypes.bool,
	}),
	onRemove: PropTypes.func.isRequired,
};

export { IMAGE_TYPES };
export default FilePreviewComponent;
