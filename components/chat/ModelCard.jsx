import React from 'react';

const ModelCard = ({ persona, onSelect, isSelected }) => {
	const handleKeyPress = (e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			onSelect(persona);
		}
	};

	return (
		<div
			className={`
        relative rounded-xl shadow-lg cursor-pointer
        bg-white dark:bg-gray-800
        transition-all duration-300 ease-in-out
        hover:-translate-y-2 hover:shadow-2xl
        ${isSelected ? 'ring-4 ring-blue-500' : ''}
      `}
			onClick={() => onSelect(persona)}
			role='button'
			tabIndex={0}
			onKeyPress={handleKeyPress}
			aria-pressed={isSelected}>
			{/* Hover Gradient Effect */}
			<div
				className={`
          absolute inset-0 rounded-xl opacity-0 
          hover:opacity-20 transition-opacity duration-300
          bg-gradient-to-br ${persona.color || 'from-blue-500 to-purple-500'}
        `}
			/>

			{/* Main Content */}
			<div className='p-4 flex items-start space-x-4 relative'>
				{/* Image Container */}
				<div className='flex-shrink-0'>
					<img
						src={`/images/personas/${
							persona.role?.toLowerCase().replace(' ', '_') || 'default'
						}.jpg`}
						alt={`${persona.name} avatar`}
						className='w-24 h-24 rounded-full object-cover
              transition-transform duration-300 hover:scale-105
              select-none'
						onError={(e) => {
							e.target.src = '/images/default-avatar.jpg';
						}}
					/>
				</div>

				{/* Text Content */}
				<div className='flex-grow'>
					<h3
						className='text-lg font-semibold 
            text-gray-900 dark:text-white 
            hover:text-blue-600 dark:hover:text-blue-400 
            transition-colors duration-300 select-none'>
						{persona.name}
					</h3>
					<p
						className='text-sm text-gray-600 dark:text-gray-300 
            mt-1 select-none'>
						{persona.role}
					</p>

					{/* Info Section */}
					<div className='mt-2 text-xs text-gray-500 dark:text-gray-400 select-none'>
						<p>Engine: {persona.engine}</p>
						<p>Role: {persona.role}</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ModelCard;
