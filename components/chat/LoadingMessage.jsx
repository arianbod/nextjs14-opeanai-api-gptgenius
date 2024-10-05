import React from 'react';

const LoadingMessage = () => (
	<div className='flex justify-start mb-4'>
		<div className='bg-gray-700/30 text-gray-100 p-4 rounded-2xl backdrop-blur-md shadow-lg'>
			<div className='flex items-center space-x-2'>
				<div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'></div>
				<div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150'></div>
				<div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300'></div>
			</div>
		</div>
	</div>
);

export default LoadingMessage;
