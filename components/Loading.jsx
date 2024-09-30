import React from 'react';

const Loading = () => {
	return (
		<div className='flex place-content-center place-items-center h-screen w-full z-40 fixed '>
			<div className='rounded-full w-12 h-12 border-b-2 border-blue-500 animate-spin'></div>
		</div>
	);
};

export default Loading;
