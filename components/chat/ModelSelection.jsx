import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
	FaRobot,
	FaImage,
	FaUserMd,
	FaHardHat,
	FaLaptopCode,
	FaChalkboardTeacher,
	FaBriefcase,
	FaBook,
	FaMusic,
	FaCamera,
	FaChartLine,
} from 'react-icons/fa';
import { SiOpenai } from 'react-icons/si';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import Image from 'next/image';

export const AIPersonas = [
	// OpenAI Personas
	{
		key: 'BABAGPT',
		name: 'BABAGPT',
		role: 'BABAGPT AI Assistant',
		icon: SiOpenai,
		color: 'from-green-400 to-blue-500',
		engine: 'OpenAI',
	},
	{
		key: 'CHATGPT',
		name: 'ChatGPT',
		role: 'AI Assistant',
		icon: SiOpenai,
		color: 'from-green-400 to-blue-500',
		engine: 'OpenAI',
	},
	{
		key: 'DALLE',
		name: 'DALL-E',
		role: 'Image Generator',
		icon: FaImage,
		color: 'from-purple-400 to-pink-500',
		engine: 'OpenAI',
	},
	{
		key: 'ALEX',
		name: 'Alex',
		role: 'Business Advisor',
		icon: FaBriefcase,
		color: 'from-indigo-400 to-purple-500',
		engine: 'OpenAI',
	},
	{
		key: 'NOAH',
		name: 'Noah',
		role: 'Data Analyst',
		icon: FaChartLine,
		color: 'from-green-400 to-blue-500',
		engine: 'OpenAI',
	},
	// Claude Personas
	{
		key: 'CLAUDE',
		name: 'Claude',
		role: 'AI Assistant',
		icon: FaRobot,
		color: 'from-yellow-400 to-orange-500',
		engine: 'Claude',
	},
	{
		key: 'EMMA',
		name: 'Emma',
		role: 'Content Writer',
		icon: FaBook,
		color: 'from-pink-400 to-red-500',
		engine: 'Claude',
	},
	// Jina Personas
	{
		key: 'JINA',
		name: 'Jina',
		role: 'Doctor',
		icon: FaUserMd,
		color: 'from-red-400 to-pink-500',
		engine: 'Jina',
	},
	{
		key: 'LUCAS',
		name: 'Lucas',
		role: 'Musician',
		icon: FaMusic,
		color: 'from-purple-400 to-indigo-500',
		engine: 'Jina',
	},
	// Perplexity Persona
	{
		key: 'PERPLEXITY',
		name: 'Perplexity',
		role: 'AI Assistant',
		icon: FaHardHat,
		color: 'from-blue-400 to-purple-500',
		engine: 'Perplexity',
	},
	// Custom Personas
	{
		key: 'ALBERTO',
		name: 'Alberto',
		role: 'Engineer',
		icon: FaHardHat,
		color: 'from-blue-400 to-indigo-500',
		engine: 'Custom',
	},
	{
		key: 'KOOROSH',
		name: 'Koorosh',
		role: 'Developer',
		icon: FaLaptopCode,
		color: 'from-green-400 to-teal-500',
		engine: 'Custom',
	},
	{
		key: 'SARAH',
		name: 'Sarah',
		role: 'Teacher',
		icon: FaChalkboardTeacher,
		color: 'from-yellow-400 to-red-500',
		engine: 'Custom',
	},
	{
		key: 'MIA',
		name: 'Mia',
		role: 'Photographer',
		icon: FaCamera,
		color: 'from-yellow-400 to-pink-500',
		engine: 'Custom',
	},
];

const ModelCard = ({ persona, onSelect, isSelected }) => {
	const Icon = persona.icon;
	return (
		<motion.div
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
			animate={isSelected ? { scale: 1.05, borderColor: '#3b82f6' } : {}}
			className={`bg-gradient-to-br select-none ${
				persona.color
			} rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition duration-300 ${
				isSelected ? 'ring-4 ring-blue-500' : ''
			}`}
			onClick={() => {
				console.log('Model selected:', persona);
				onSelect(persona);
			}}
			role='button'
			tabIndex={0}
			onKeyPress={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					console.log('Model selected (keyboard):', persona);
					onSelect(persona);
				}
			}}
			aria-pressed={isSelected}
			data-tooltip-id={`tooltip-${persona.key}`}
			data-tooltip-content={`Engine: ${persona.engine}\nRole: ${persona.role}`}>
			<div className='p-6 flex flex-col items-center text-white select-none'>
				{persona.name === 'BABAGPT' ? (
					<Image
						height={300}
						width={300}
						alt='logo'
						src='/babagpt_bw.svg'
						className='w-16 h-16 mb-4 animate-pulse rounded-full p-1'
					/>
				) : (
					<Icon
						className='w-16 h-16 mb-4'
						aria-hidden='true'
					/>
				)}
				<h3 className='text-xl font-bold mb-2 select-none'>{persona.name}</h3>
				<p className='text-sm opacity-75 select-none'>{persona.role}</p>
			</div>
			<Tooltip
				id={`tooltip-${persona.key}`}
				place='top'
			/>
		</motion.div>
	);
};

const ModelSelection = ({ onSelect, selectedModel }) => {
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
		<div className='w-full p-4'>
			<h2 className='text-3xl font-bold mb-6 text-center'>
				Choose Your AI Companion
			</h2>
			<div className='mb-6 flex justify-center'>
				<input
					type='text'
					placeholder='Search by name or role...'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className='w-full max-w-md px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
				/>
			</div>
			{Object.keys(groupedPersonas).length > 0 ? (
				Object.keys(groupedPersonas).map((engine) => (
					<div
						key={engine}
						className='mb-8'>
						<h3 className='text-2xl font-semibold mb-4'>{engine} Engine</h3>
						<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
							{groupedPersonas[engine].map((persona) => (
								<ModelCard
									key={persona.key}
									persona={persona}
									onSelect={onSelect}
									isSelected={
										selectedModel && selectedModel.key === persona.key
									}
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
