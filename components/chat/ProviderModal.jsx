// components/chat/ProviderModal.jsx
import React from 'react';
import { FaTimes } from 'react-icons/fa';
import ModelCard from './ModelCard';

const ProviderModal = ({
	provider,
	personas,
	onClose,
	selectedModel,
	onSelect,
}) => {
	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4'>
			<div className='bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl h-full max-h-screen overflow-y-auto relative p-6'>
				{/* Close Button */}
				<button
					onClick={onClose}
					className='absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
					aria-label='Close Provider Modal'>
					<FaTimes size={24} />
				</button>

				{/* Provider Header */}
				<div className='flex items-center justify-center py-4 border-b border-gray-200 dark:border-gray-700'>
					<div className='text-3xl mr-4'>{personas[0].icon}</div>
					<h2 className='text-2xl font-semibold text-gray-800 dark:text-gray-200'>
						{provider} Engine
					</h2>
				</div>

				{/* Models List */}
				<div className='p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
					{personas.map((persona) => (
						<ModelCard
							key={persona.key}
							persona={persona}
							onSelect={onSelect}
							isSelected={selectedModel && selectedModel.key === persona.key}
							isRecent={false} // Standard Model Card
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export default ProviderModal;
