// components/MemberProfile/MemberProfile.jsx
import React, { useState, memo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FiCopy, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { useTranslations } from '@/context/TranslationContext';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { FaCoins, FaUser, FaSignOutAlt } from 'react-icons/fa';
import LocaleLink from '@/components/hoc/LocalLink';

const MemberProfile = () => {
	const { user, tokenBalance, logout } = useAuth();
	const { dict, isRTL } = useTranslations();
	const [isExpanded, setIsExpanded] = useState(false);

	const copyToken = () => {
		if (!user?.token) return;
		navigator.clipboard
			.writeText(user.token)
			.then(() => toast.success(dict.auth.tokenCopied))
			.catch(() => toast.error(dict.auth.errors.copyFailed));
	};

	const maskToken = (token) => {
		if (!token) return '';
		return `${token.slice(0, 6)}...${token.slice(-4)}`;
	};

	return (
		<div className='mt-auto border-t border-base-300'>
			{/* Profile Section */}
			<div className='px-4 py-2 flex flex-col'>
				{/* Token Balance Row */}
				{/* <div className='flex items-center justify-between mt-2'>
					<div className='flex items-center gap-1.5'>
						<FaCoins className='w-4 h-4 text-yellow-500' />
						<span>{tokenBalance}</span>
					</div>
					<Link
						href='/token'
						className='px-3 py-1 bg-primary text-primary-content text-sm rounded-full hover:bg-primary-focus transition-colors'>
						+ {dict.global.purchaseTokens}
					</Link>
				</div> */}
				{/* Token Display Row */}
				<div className='flex items-center justify-between text-sm'>
					<div className='flex items-center gap-2'>
						<span className='text-base-content/70'>
							{maskToken(user?.token)}
						</span>
						<button
							onClick={copyToken}
							className='p-1.5 hover:bg-base-300 rounded-md transition-colors'
							aria-label='Copy token'>
							<FiCopy className='w-4 h-4' />
						</button>
					</div>
					<button
						onClick={() => setIsExpanded(!isExpanded)}
						className='lg:hidden p-1.5 hover:bg-base-300 rounded-md'>
						{isExpanded ? <FiChevronUp /> : <FiChevronDown />}
					</button>
				</div>

				{/* Expanded Menu - Always visible on desktop, toggleable on mobile */}
				<div className={`${isExpanded || 'hidden lg:block'} mt-2 space-y-1`}>
					{/* Account Settings Link */}
					<LocaleLink
						href={`/account/${user.userId}`}
						className='flex place-items-center gap-2 p-2 hover:bg-base-300 rounded-lg transition-colors w-full'>
						<FaUser className='w-4 h-4' />
						<span className='text-sm'>
							{dict.auth.accountManagement.accountSetting}
						</span>
					</LocaleLink>

					{/* Logout Button */}
					<button
						onClick={logout}
						className='flex place-items-center gap-2 p-2 hover:bg-base-300 rounded-lg transition-colors w-full text-error'>
						<FaSignOutAlt className='w-4 h-4' />
						<span className='text-sm'>
							{' '}
							{dict.auth.accountManagement.logout}
						</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default memo(MemberProfile);
