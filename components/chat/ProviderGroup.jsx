// components/chat/ProviderGroup.jsx
import React from 'react';
import ProviderModal from './ProviderModal';
import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const ProviderGroup = ({ provider, personas, selectedModel, onSelect }) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className='mb-6'>
			{/* Provider Header */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='w-full flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg shadow'
				aria-expanded={isOpen}
				aria-controls={`provider-modal-${provider}`}>
				<span className='text-lg font-semibold text-gray-800 dark:text-gray-200'>
					{provider} Engine
				</span>
				<FaChevronDown
					className={`transition-transform duration-300 ${
						isOpen ? 'transform rotate-180' : ''
					}`}
				/>
			</button>

			{/* Provider Modal */}
			{isOpen && (
				<ProviderModal
					provider={provider}
					personas={personas}
					onClose={() => setIsOpen(false)}
					selectedModel={selectedModel}
					onSelect={onSelect}
				/>
			)}
		</div>
	);
};

export default ProviderGroup;
