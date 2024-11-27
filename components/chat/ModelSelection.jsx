// components/chat/ModelSelection.jsx
import React, { useState, useMemo } from 'react';
import ProviderGroup from './ProviderGroup';
import PersonaSuggester from './PersonaSuggester';
import { AIPersonas } from '@/lib/Personas';
import { useChat } from '@/context/ChatContext';
import ModelCard from './ModelCard';

const ModelSelection = () => {
	const { model, handleModelSelect, chatList } = useChat();
	const [searchTerm, setSearchTerm] = useState('');

	// Filter personas based on search term
	const filteredPersonas = useMemo(() => {
		const lowerSearch = searchTerm.toLowerCase();
		return AIPersonas.filter(
			(persona) =>
				persona.name.toLowerCase().includes(lowerSearch) ||
				persona.role.toLowerCase().includes(lowerSearch) ||
				(persona.description &&
					persona.description.toLowerCase().includes(lowerSearch))
		);
	}, [searchTerm]);

	// Group personas by provider
	const groupedPersonas = useMemo(() => {
		return filteredPersonas.reduce((groups, persona) => {
			const { provider } = persona;
			if (!groups[provider]) {
				groups[provider] = [];
			}
			groups[provider].push(persona);
			return groups;
		}, {});
	}, [filteredPersonas]);

	// Compute recently used models based on the 10 latest chats
	const recentlyUsedModels = useMemo(() => {
		if (!chatList || chatList.length === 0) return [];

		// Sort chats by updatedAt descending
		const sortedChats = [...chatList].sort(
			(a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
		);

		// Extract the modelCodeName from the top 10 latest chats
		const topChats = sortedChats.slice(0, 10);
		const modelCodeNames = topChats
			.map((chat) => chat.modelCodeName)
			.filter(Boolean);

		// Deduplicate modelCodeNames while maintaining order
		const uniqueModelCodeNames = [...new Set(modelCodeNames)];

		// Map modelCodeNames to their corresponding personas
		const recentModels = uniqueModelCodeNames
			.map((codeName) =>
				AIPersonas.find((persona) => persona.modelCodeName === codeName)
			)
			.filter(Boolean); // Remove undefined entries

		return recentModels;
	}, [chatList]);

	return (
		<div className='w-full px-4 py-6'>
			{/* Search Input */}
			<div className='mb-6'>
				<input
					type='text'
					placeholder='Search models...'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className='w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                focus:outline-none focus:ring-2 focus:ring-gray-500'
				/>
			</div>

			{/* Persona Suggester */}
			<PersonaSuggester onSelect={handleModelSelect} />

			{/* Recently Used Models Section */}
			{recentlyUsedModels.length > 0 && (
				<div className='mb-8'>
					<h2 className='text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200'>
						Recently Used Models
					</h2>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
						{recentlyUsedModels.map((persona) => (
							<ModelCard
								key={persona.key}
								persona={persona}
								onSelect={handleModelSelect}
								isSelected={model && model.key === persona.key}
								isRecent={true} // Pass the isRecent prop
							/>
						))}
					</div>
				</div>
			)}

			{/* Personas List */}
			<div>
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
						No models found.
					</p>
				)}
			</div>
		</div>
	);
};

export default ModelSelection;
