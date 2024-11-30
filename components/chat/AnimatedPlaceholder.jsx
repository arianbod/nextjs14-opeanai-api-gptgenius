import React from 'react';

const AnimatedPlaceholder = ({ text = 'Write your response here' }) => {
	return (
		<div className='relative flex items-center'>
			{/* Larger floating dot indicator */}
			<div className='absolute -top-5 left-0 animate-bounce'>
				<div className='w-2.5 h-2.5 bg-blue-400 rounded-full shadow-lg' />
				<div className='w-1.5 h-1.5 bg-blue-400 rounded-full absolute -bottom-1 left-0.5 opacity-50' />
			</div>

			<span className='text-gray-400 pl-4'>{text}</span>
		</div>
	);
};

export default AnimatedPlaceholder;
