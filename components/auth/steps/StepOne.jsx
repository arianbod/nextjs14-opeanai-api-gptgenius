import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { FiUserPlus, FiLogIn } from 'react-icons/fi';
import { useTranslations } from '@/context/TranslationContext';

const StepOne = ({ isRegistering, onModeChange, onNext }) => {
	const { dict, isRTL } = useTranslations();

	// Safeguard against undefined translations
	if (!dict || !dict.auth) {
		return <div>Loading...</div>; // Or any other fallback UI
	}

	const options = [
		{
			id: 'register',
			title: dict.auth.register?.title || 'Register',
			icon: FiUserPlus,
			description: dict.auth.register?.info || '',
			isActive: isRegistering,
		},
		{
			id: 'login',
			title: dict.auth.login?.title || 'Login',
			icon: FiLogIn,
			description: dict.auth.login?.info || '',
			isActive: !isRegistering,
		},
	];

	const handleSelect = (optionId) => {
		const isRegisterMode = optionId === 'register';
		onModeChange(isRegisterMode);
		onNext();
	};

	// Features with safe access
	const features = Object.values(dict.auth.welcome?.features?.list || {});

	return (
		<div className='space-y-8'>
			<div className='space-y-4'>
				<motion.h1
					className='text-3xl font-bold text-center text-gray-800 dark:text-white'
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}>
					{dict.auth.welcome?.title || 'Welcome to BabaGPT'}
				</motion.h1>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className='text-center space-y-4'>
					<p className='text-gray-600 dark:text-gray-300'>
						{dict.auth.welcome?.description || ''}
					</p>

					<div className='flex flex-wrap justify-center gap-2 mt-4'>
						{features.map((feature, index) => (
							<motion.span
								key={index}
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.3 + index * 0.1 }}
								className='px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full text-sm text-blue-600 dark:text-blue-300'>
								{feature}
							</motion.span>
						))}
					</div>
				</motion.div>
			</div>

			<div className='grid gap-4'>
				{options.map((option, index) => (
					<motion.button
						key={option.id}
						onClick={() => handleSelect(option.id)}
						className={`group relative w-full p-6 rounded-xl shadow-lg transition-all duration-300 border-2 
              ${
								option.isActive
									? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
									: 'bg-white dark:bg-gray-700 border-transparent hover:border-blue-500'
							}`}
						initial={{
							opacity: 0,
							x: isRTL
								? index % 2 === 0
									? 20
									: -20
								: index % 2 === 0
								? -20
								: 20,
						}}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: index * 0.2 }}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}>
						<div className='flex items-center gap-4'>
							<div
								className={`p-3 bg-blue-100 dark:bg-blue-900 rounded-lg ${
									isRTL ? 'order-last' : ''
								}`}>
								<option.icon
									className={`w-6 h-6 ${
										option.isActive
											? 'text-blue-600 dark:text-blue-400'
											: 'text-blue-500'
									}`}
								/>
							</div>
							<div className={`${isRTL ? 'text-right' : 'text-left'}`}>
								<h2 className='text-xl font-semibold text-gray-800 dark:text-white'>
									{option.title}
								</h2>
								<p className='text-sm text-gray-500 dark:text-gray-300'>
									{option.description}
								</p>
							</div>
						</div>

						{option.isActive && (
							<motion.div
								className={`absolute w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center ${
									isRTL ? '-left-2 -top-2' : '-right-2 -top-2'
								}`}
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}>
								<span className='text-white text-sm'>✓</span>
							</motion.div>
						)}
					</motion.button>
				))}
			</div>
		</div>
	);
};

export default memo(StepOne);
