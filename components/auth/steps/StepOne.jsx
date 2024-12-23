import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { FiUserPlus, FiLogIn } from 'react-icons/fi';

const StepOne = ({ isRegistering, onModeChange, onNext, dict }) => {
	const options = [
		{
			id: 'register',
			title: dict.auth.register.title,
			icon: FiUserPlus,
			description: dict.auth.register.info,
			isActive: isRegistering,
		},
		{
			id: 'login',
			title: dict.auth.login.title,
			icon: FiLogIn,
			description: dict.auth.login.info,
			isActive: !isRegistering,
		},
	];

	const handleSelect = (optionId) => {
		const isRegisterMode = optionId === 'register';
		onModeChange(isRegisterMode);
		onNext();
	};

	return (
		<div className='space-y-8'>
			<motion.h1
				className='text-3xl font-bold text-center text-gray-800 dark:text-white'
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}>
				Welcome to BabaGPT
			</motion.h1>

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
						initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: index * 0.2 }}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}>
						<div className='flex items-center gap-4'>
							<div className='p-3 bg-blue-100 dark:bg-blue-900 rounded-lg'>
								<option.icon
									className={`w-6 h-6 ${
										option.isActive
											? 'text-blue-600 dark:text-blue-400'
											: 'text-blue-500'
									}`}
								/>
							</div>
							<div className='text-left'>
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
								className='absolute -right-2 -top-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center'
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
