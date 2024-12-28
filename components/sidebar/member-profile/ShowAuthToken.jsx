import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from '@/context/TranslationContext';
import toast from 'react-hot-toast';
import { FaCopy, FaEye, FaEyeSlash } from 'react-icons/fa';

const ShowAuthToken = () => {
	const { user } = useAuth();
	const { dict } = useTranslations();
	const [isTokenVisible, setIsTokenVisible] = useState(false);

	const copyToken = () => {
		navigator.clipboard.writeText(user.token);
		toast.success(dict.auth.tokenCopied || 'Token copied to clipboard!');
	};

	const toggleTokenVisibility = () => {
		setIsTokenVisible(!isTokenVisible);
	};

	const maskToken = (token) => {
		if (!token) return '';
		return token.slice(0, 5) + '...' + token.slice(-5);
	};

	return (
		<div className='flex flex-col space-y-3 p-4 bg-gray-100 rounded-lg'>
			<h2 className='font-semibold text-center text-lg'>
				{dict.auth.OTPTitle}
			</h2>

			<div className='flex items-center justify-between bg-white p-2 rounded-md shadow-sm'>
				<span className='flex-grow text-sm'>
					{isTokenVisible ? user.token : maskToken(user.token)}
				</span>

				<div className='flex items-center space-x-2'>
					<button
						onClick={toggleTokenVisibility}
						className='text-gray-600 hover:text-blue-500 transition-colors'
						aria-label={isTokenVisible ? 'Hide Token' : 'Show Token'}>
						{isTokenVisible ? <FaEyeSlash /> : <FaEye />}
					</button>

					<button
						onClick={copyToken}
						className='text-gray-600 hover:text-green-500 transition-colors'
						aria-label='Copy Token'>
						<FaCopy />
					</button>
				</div>
			</div>

			<span className='text-xs text-gray-500 text-center'>
				{dict.auth.OTPDescription}
			</span>
		</div>
	);
};

export default React.memo(ShowAuthToken);
