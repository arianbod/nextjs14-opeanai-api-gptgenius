import { useAuth } from '@/context/AuthContext';
import { useTranslations } from '@/context/TranslationContext';
import React, { memo } from 'react';
import toast from 'react-hot-toast';
import { FaCopy } from 'react-icons/fa';

const ShowAuthToken = () => {
	const { user } = useAuth();
	const dict = useTranslations();
	const copyToken = () => {
		navigator.clipboard.writeText(user.token);
		toast.success(dict.auth.tokenCopied || 'Token copied to clipboard!');
	};

	return (
		<div className='flex flex-col'>
			<h2 className='font-semibold text-center'>{dict.auth.OTPTitle}</h2>
			<div className='flex items-center'>
				<h1
					onClick={copyToken}
					className='cursor-pointer px-1 w-fit mx-auto rounded-lg animate-pulse text-center'>
					{user.token}
				</h1>
			</div>
			<span className='text-sm text-center'>{dict.auth.OTPDescription}</span>
		</div>
	);
};

export default memo(ShowAuthToken);
