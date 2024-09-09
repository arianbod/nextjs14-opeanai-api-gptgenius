// LoadingMessage.js
import React from 'react';

const LoadingMessage = () => (
	<div className='flex justify-start'>
		<div className='bg-base-100 text-base-content p-3 rounded-lg'>
			<div className='typing-indicator'>
				<span></span>
				<span></span>
				<span></span>
			</div>
		</div>
	</div>
);

export default LoadingMessage;
