// FileModal.jsx
import React from 'react';
import { FileText, X } from 'lucide-react';

const FileModal = ({ isOpen, onClose, fileData }) => {
	if (!isOpen || !fileData) return null;

	const formatFileSize = (bytes) => {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
		return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
	};

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
			<div className='bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl mx-4 p-6'>
				<div className='flex justify-between items-center mb-4'>
					<h2 className='text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2'>
						<FileText className='w-5 h-5' />
						File Details
					</h2>
					<button
						onClick={onClose}
						className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full'>
						<X className='w-5 h-5' />
					</button>
				</div>

				<div className='space-y-4'>
					<div className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg'>
						<h3 className='font-medium mb-2 text-gray-700 dark:text-gray-300'>
							File Information
						</h3>
						<div className='grid grid-cols-2 gap-2 text-sm'>
							<span className='text-gray-500'>Name:</span>
							<span className='text-gray-900 dark:text-gray-100'>
								{fileData.name}
							</span>
							<span className='text-gray-500'>Type:</span>
							<span className='text-gray-900 dark:text-gray-100'>
								{fileData.type}
							</span>
							<span className='text-gray-500'>Size:</span>
							<span className='text-gray-900 dark:text-gray-100'>
								{formatFileSize(fileData.size)}
							</span>
						</div>
					</div>

					{fileData.contentSummary && (
						<div className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg'>
							<h3 className='font-medium mb-2 text-gray-700 dark:text-gray-300'>
								Content Summary
							</h3>
							<p className='text-sm text-gray-900 dark:text-gray-100'>
								{fileData.contentSummary}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default FileModal;
