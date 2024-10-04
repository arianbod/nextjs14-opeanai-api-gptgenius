import React, { useState } from 'react';
import ModelCard from './ModelCard';
import { AIPersonas } from '@/lib/Personas';
import { useChat } from '@/context/ChatContext';

const ModelSelection = ({ onSelect }) => {
	const { model } = useChat();
	const [searchTerm, setSearchTerm] = useState('');

	const filteredPersonas = AIPersonas.filter(
		(persona) =>
			persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			persona.role.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const groupedPersonas = filteredPersonas.reduce((groups, persona) => {
		const { engine } = persona;
		if (!groups[engine]) {
			groups[engine] = [];
		}
		groups[engine].push(persona);
		return groups;
	}, {});

	return (
		<div className='w-full px-2 min-h-screen'>
			{/* ... Rest of your component ... */}
			{Object.keys(groupedPersonas).length > 0 ? (
				Object.keys(groupedPersonas).map((engine) => (
					<div
						key={engine}
						className='mb-12'>
						<h3 className='text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300'>
							{engine} Engine
						</h3>
						<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
							{groupedPersonas[engine].map((persona) => (
								<ModelCard
									key={persona.key}
									persona={persona}
									onSelect={onSelect}
									isSelected={model && model.key === persona.key}
								/>
							))}
						</div>
					</div>
				))
			) : (
				<p className='text-center text-gray-500'>No personas found.</p>
			)}
		</div>
	);
};

export default ModelSelection;
