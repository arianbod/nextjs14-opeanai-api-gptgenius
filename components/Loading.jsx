import React from 'react';

const Loading = () => {
	return (
		<div className='flex place-content-center place-items-center h-screen w-full left-0 right-0 m-auto top-0 bottom-0 z-40 fixed '>
			<div className='rounded-full w-12 h-12 border-b-2 border-blue-500 animate-spin'></div>
		</div>
	);
};

export default Loading;
