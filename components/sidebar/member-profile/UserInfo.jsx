// components/MemberProfile/UserInfo.jsx
import React, { memo } from 'react';

const UserInfo = ({ token }) => (
	<div>
		<p className='text-sm text-base-content font-semibold'>
			{token.substring(0, 8)}...
		</p>
	</div>
);
export default memo(UserInfo);
