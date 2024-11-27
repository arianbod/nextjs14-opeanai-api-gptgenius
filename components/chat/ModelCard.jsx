// components/chat/ModelCard.jsx
import React from 'react';
import { FaCheckCircle, FaLightbulb } from 'react-icons/fa';

const ModelCard = ({ persona, onSelect, isSelected }) => {
	const handleKeyPress = (e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			onSelect(persona);
		}
	};

	return (
		<div
			className={`
        relative rounded-xl shadow-md cursor-pointer
        bg-gradient-to-br ${persona.color || 'from-blue-500 to-purple-500'}
        transition-transform duration-300 ease-in-out
        hover:scale-105 hover:shadow-2xl
        ${isSelected ? 'ring-4 ring-blue-500' : ''}
      `}
			onClick={() => onSelect(persona)}
			role='button'
			tabIndex={0}
			onKeyPress={handleKeyPress}
			aria-pressed={isSelected}>
			{/* Overlay for dark mode */}
			<div
				className={`
          absolute inset-0 rounded-xl opacity-0 
          hover:opacity-20 transition-opacity duration-300
          bg-black
        `}
			/>

			{/* Main Content */}
			<div className='p-6 flex flex-col items-center text-center relative'>
				{/* Image Container */}
				<div className='mb-4'>
					<img
						src={persona.avatar || '/images/default-avatar.jpg'}
						alt={`${persona.name} avatar`}
						className='w-24 h-24 rounded-full object-cover
              border-4 border-white shadow-md
              transition-transform duration-300 hover:scale-110
              select-none'
						onError={(e) => {
							e.target.src = '/images/default-avatar.jpg';
						}}
					/>
				</div>

				{/* Text Content */}
				<div className='flex flex-col items-center'>
					<h3
						className='text-xl font-bold 
            
              transition-colors duration-300 select-none'>
						{persona.name}
					</h3>

					{/* Conditionally Render Role */}
					{persona.role && persona.role !== persona.name && (
						<p
							className='text-sm 
                mt-1 select-none'>
							{persona.role}
						</p>
					)}

					{/* Description */}
					{persona.description && (
						<p
							className='text-sm  
                mt-2 select-none'>
							{persona.description}
						</p>
					)}

					{/* Features Section */}
					<div className='mt-4 flex flex-wrap gap-2'>
						{persona.features && (
							<>
								{persona.features.suitableFor.map((feature, index) => (
									<span
										key={index}
										className='flex items-center px-2 py-1 bg-blue-600 text-white  rounded-full text-xs'>
										<FaCheckCircle className='mr-1' />
										{feature}
									</span>
								))}
								{persona.features.bestFor.map((feature, index) => (
									<span
										key={index}
										className='flex items-center px-2 py-1 bg-yellow-500 text-white  rounded-full text-xs'>
										<FaLightbulb className='mr-1' />
										{feature}
									</span>
								))}
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ModelCard;
