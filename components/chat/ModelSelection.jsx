// components/chat/ModelSelection.jsx
import React, { useState } from 'react';
import ProviderGroup from './ProviderGroup';
import PersonaSuggester from './PersonaSuggester';
import { AIPersonas } from '@/lib/Personas';
import { useChat } from '@/context/ChatContext';

const ModelSelection = () => {
	const { model, handleModelSelect } = useChat();
	const [searchTerm, setSearchTerm] = useState('');

	// Filter personas based on search term
	const filteredPersonas = AIPersonas.filter(
		(persona) =>
			persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			persona.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(persona.description &&
				persona.description.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	// Group personas by provider
	const groupedPersonas = filteredPersonas.reduce((groups, persona) => {
		const { provider } = persona;
		if (!groups[provider]) {
			groups[provider] = [];
		}
		groups[provider].push(persona);
		return groups;
	}, {});

	return (
		<div className='w-full px-4 py-6'>
			{/* Search Input */}
			<div className='mb-6'>
				<input
					type='text'
					placeholder='Search personas...'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className='w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
            focus:outline-none focus:ring-2 focus:ring-gray-500'
				/>
			</div>

			{/* Persona Suggester */}
			<PersonaSuggester onSelect={handleModelSelect} />

			{/* Personas List */}
			{Object.keys(groupedPersonas).length > 0 ? (
				Object.keys(groupedPersonas).map((provider) => (
					<ProviderGroup
						key={provider}
						provider={provider}
						personas={groupedPersonas[provider]}
						selectedModel={model}
						onSelect={handleModelSelect}
					/>
				))
			) : (
				<p className='text-center text-gray-500 dark:text-gray-400'>
					No personas found.
				</p>
			)}
		</div>
	);
};

export default ModelSelection;
