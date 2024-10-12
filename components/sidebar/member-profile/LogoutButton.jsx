// components/MemberProfile/LogoutButton.jsx
import React, { memo } from 'react';
import { FiLogOut } from 'react-icons/fi';

const LogoutButton = ({ onLogout }) => (
	<button
		onClick={onLogout}
		className='btn btn-sm btn-error text-error-content hover:bg-error-content hover:text-error transition'>
		<FiLogOut className='mr-2' />
	</button>
);
export default memo(LogoutButton);
