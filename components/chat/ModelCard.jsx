import React from 'react';
import Image from 'next/image';

const ModelCard = ({ persona, onSelect, isSelected }) => {
	const Icon = persona.icon;

	return (
		<div
			className={`group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl ${
				isSelected ? 'ring-4 ring-blue-500' : ''
			}`}
			onClick={() => onSelect(persona)}
			role='button'
			tabIndex={0}
			onKeyPress={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					onSelect(persona);
				}
			}}
			aria-pressed={isSelected}>
			{/* Background gradient */}
			<div
				className={`absolute inset-0 bg-gradient-to-br ${persona.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
			{/* Content */}
			<div className='p-2 flex items-center space-x-4 relative z-10'>
				{/* Icon or Image */}
				<div className='flex-shrink-0'>
					{/* {persona.name === 'BabaGPT' ? (

						<Image
							height={64}
							width={64}
							alt='logo'
							src='/babagpt_bw.svg'
							className='w-16 h-16 rounded-full transition-transform duration-300 group-hover:scale-110'
						/>
						) : (
							<Icon
							className='w-16 h-16 text-blue-500 transition-transform duration-300 group-hover:scale-110'
							aria-hidden='true'
							/>
							)} */}
					<Image
						height={128}
						width={128}
						alt={`${persona.name} logo`}
						src={`/images/personas/${
							persona.role?.toLowerCase().replace(' ', '_') || 'default'
						}.jpg`}
						className='w-32 h-full rounded-lg transition-all duration-300 group-hover:scale-110'
						onError={(e) => {
							console.error(`Failed to load image for ${persona.name}:`, e);
							// e.target.src = '/fallback-image.jpg'; // Make sure this fallback image exists in your public folder
						}}
						onLoad={() =>
							console.log(`Successfully loaded image for ${persona.name}`)
						}
					/>
				</div>

				{/* Text Content */}
				<div className='flex-grow'>
					<h3 className='text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300'>
						{persona.name}
					</h3>
					<p className='text-sm text-gray-600 dark:text-gray-300 mt-1 group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors duration-300'>
						{persona.role}
					</p>
				</div>
			</div>
			{/* Tooltip */}
			<div className=' inset-0 flex items-center w-full justify-center group-hover:opacity-100 transition-opacity duration-300'>
				<div className='bg-black w-full bg-opacity-75 text-white text-xs rounded-md py-1 px-2 pointer-events-none'>
					Engine: {persona.engine}
					<br />
					Role: {persona.role}
				</div>
			</div>
		</div>
	);
};

export default ModelCard;
