// components/sidebar/TokenSection.jsx
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from '@/context/TranslationContext';
import { FaCoins, FaPlus } from 'react-icons/fa'; // Using FontAwesome icons

const TokenSection = ({ className }) => {
	const { tokenBalance } = useAuth();
	const { t } = useTranslations();

	return (
		<div className={`${className} bg-base-300/50 rounded-lg p-3`}>
			<div className='flex items-center justify-between'>
				{/* Token Balance */}
				<div className='flex items-center gap-2'>
					<div className='flex items-center gap-1.5'>
						<FaCoins className='w-4 h-4 text-yellow-500' />
						<span className='font-semibold'>{tokenBalance}</span>
					</div>
				</div>

				{/* Buy Button */}
				<Link
					href='/token'
					className='group flex gap-1.5 px-3 py-1.5 place-items-center transition-all
                             rounded-full text-sm'>
					<FaPlus className='w-3 h-3' />
					<span className='hidden sm:inline'>
						{t('global.purchaseTokens') || 'Buy Tokens'}
					</span>
				</Link>
			</div>
		</div>
	);
};

export default TokenSection;
