// components/chat/ModelCard.jsx
import React from 'react';
import { FaCheckCircle, FaLightbulb } from 'react-icons/fa';

const ModelCard = ({ persona, onSelect, isSelected, isRecent }) => {
	const handleKeyPress = (e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			onSelect(persona);
		}
	};

	return (
		<div
			className={`
        relative rounded-lg shadow-md cursor-pointer
        bg-gradient-to-r ${persona.color || 'from-blue-500 to-purple-500'}
        transition-transform duration-300 ease-in-out
        hover:scale-105 hover:shadow-xl
        ${isSelected ? 'ring-4 ring-blue-500' : ''}
        ${isRecent ? 'p-3' : 'p-6'}
      `}
			onClick={() => onSelect(persona)}
			role='button'
			tabIndex={0}
			onKeyPress={handleKeyPress}
			aria-pressed={isSelected}>
			{/* Overlay for dark mode */}
			<div
				className={`
          absolute inset-0 rounded-lg opacity-0 
          hover:opacity-20 transition-opacity duration-300
          bg-black
        `}
			/>

			{/* Main Content */}
			<div className='flex flex-row items-center relative'>
				{/* Image Container */}
				<div
					className={`flex-shrink-0 ${isRecent ? 'w-12 h-12' : 'w-24 h-24'} `}>
					<img
						src={persona.avatar || '/images/default-avatar.jpg'}
						alt={`${persona.name} avatar`}
						className={`object-cover w-full h-full rounded-full transition-transform duration-300 ${
							isRecent ? 'hover:scale-105' : 'hover:scale-110'
						} ${
							persona.avatar === '/images/babagpt_bw.svg'
								? 'bg-green-600 p-1 rounded-full'
								: ''
						}`}
						onError={(e) => {
							e.target.src = '/images/default-avatar.jpg';
						}}
					/>
				</div>

				{/* Text Content */}
				<div className={`ml-4 ${isRecent ? 'flex-1' : ''}`}>
					<h3 className='text-lg font-bold text-gray-800 dark:text-gray-200'>
						{persona.name}
					</h3>

					{/* Conditionally Render Role */}
					{persona.role && persona.role !== persona.name && (
						<p className='text-sm text-gray-600 dark:text-gray-300'>
							{persona.role}
						</p>
					)}

					{/* Conditionally Render Description */}
					{persona.description && !isRecent && (
						<p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>
							{persona.description}
						</p>
					)}

					{/* Features Section - Hidden for Recently Used Models */}
					{!isRecent && persona.features && (
						<div className='mt-3 flex flex-wrap gap-2'>
							{persona.features.suitableFor.map((feature, index) => (
								<span
									key={index}
									className='flex items-center px-2 py-1 bg-blue-600 text-white rounded-full text-xs'>
									<FaCheckCircle className='mr-1' />
									{feature}
								</span>
							))}
							{persona.features.bestFor.map((feature, index) => (
								<span
									key={index}
									className='flex items-center px-2 py-1 bg-yellow-500 text-white rounded-full text-xs'>
									<FaLightbulb className='mr-1' />
									{feature}
								</span>
							))}
						</div>
					)}

					{/* Optional "Recently Used" Badge */}
					{isRecent && (
						<div className='mt-2'>
							<span className='px-2 py-0.5 bg-gray-700 text-white text-xs rounded-full'>
								Recently Used
							</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ModelCard;
