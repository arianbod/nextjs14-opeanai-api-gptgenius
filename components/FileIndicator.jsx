import React from 'react';
import { Paperclip } from 'lucide-react';

const FileIndicator = ({ fileData, onClick }) => {
	if (!fileData) return null;

	return (
		<button
			onClick={onClick}
			className='flex items-center gap-2 mt-2 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 
                 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 
                 dark:hover:bg-gray-700 transition-colors'>
			<Paperclip className='w-3 h-3' />
			<span className='truncate max-w-[200px]'>{fileData.fileName}</span>
		</button>
	);
};

export default FileIndicator;
