// components/chat/ProviderGroup.jsx
import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import ProviderModal from './ProviderModal';

const ProviderGroup = ({ provider, personas, selectedModel, onSelect }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const openProviderModal = () => {
		setIsModalOpen(true);
	};

	const closeProviderModal = () => {
		setIsModalOpen(false);
	};

	return (
		<div className='mb-6'>
			{/* Provider Summary Card */}
			<div
				className={`
          flex items-center justify-between p-4 rounded-lg bg-gray-100 dark:bg-gray-700 
          cursor-pointer transition-colors duration-300 
          hover:bg-gray-200 dark:hover:bg-gray-600
        `}
				onClick={openProviderModal}>
				<div className='flex items-center space-x-3'>
					{/* Provider Icon */}
					<div className='text-2xl'>{personas[0].icon}</div>
					{/* Provider Name */}
					<h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
						{provider} Engine
					</h2>
				</div>
				{/* Expand/Collapse Icon */}
				<div className='text-gray-600 dark:text-gray-300'>
					<FaChevronDown />
				</div>
			</div>

			{/* Provider Modal */}
			{isModalOpen && (
				<ProviderModal
					provider={provider}
					personas={personas}
					onClose={closeProviderModal}
					selectedModel={selectedModel}
					onSelect={onSelect}
				/>
			)}
		</div>
	);
};

export default ProviderGroup;
