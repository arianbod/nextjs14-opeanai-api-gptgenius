import React from 'react';

const LoadingMessage = () => (
	<div className='flex justify-start'>
		<div className='bg-base-100 text-base-content p-3 rounded-lg'>
			<div className='flex items-center'>
				<div className='dot-flashing'></div>
				<span className='ml-2'>AI is thinking...</span>
			</div>
		</div>
	</div>
);

export default LoadingMessage;
