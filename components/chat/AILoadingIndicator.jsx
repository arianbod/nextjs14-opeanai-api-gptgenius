import React from 'react';

const AILoadingIndicator = () => (
	<div className='flex items-center justify-center'>
		<div className='dot-flashing'></div>
		<span className='ml-2 text-sm text-gray-500'>AI is thinking...</span>
	</div>
);

export default AILoadingIndicator;
