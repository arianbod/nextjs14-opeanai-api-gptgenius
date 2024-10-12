// components/MemberProfile/Avatar.jsx
import React, { memo } from 'react';

const Avatar = ({ initials }) => (
	<div className='w-10 h-10 bg-base-300 rounded-full flex items-center justify-center'>
		<span className='text-sm font-semibold select-none text-base-content'>
			{initials}
		</span>
	</div>
);
export default memo(Avatar);
