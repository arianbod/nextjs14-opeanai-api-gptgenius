import React from 'react';

const LoadingMessage = () => (
	<div className='flex justify-start'>
		<div className='text-base-content p-3 rounded-lg'>
			<div className='flex items-center'>
				<div className='dot-flashing mx-4'></div>
				{/* <span className='ml-2'>...</span> */}
			</div>
		</div>
	</div>
);

export default LoadingMessage;
