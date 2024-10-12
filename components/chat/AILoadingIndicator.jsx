import React, { memo } from 'react';

const AILoadingIndicator = () => (
	<div className='flex items-center justify-center'>
		<div className='dot-flashing'></div>
	</div>
);

export default memo(AILoadingIndicator);
