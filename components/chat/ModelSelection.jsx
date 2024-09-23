import React from 'react';
import { motion } from 'framer-motion';
import {
	FaRobot,
	FaImage,
	FaUserMd,
	FaHardHat,
	FaLaptopCode,
	FaChalkboardTeacher,
} from 'react-icons/fa';
import { SiOpenai } from 'react-icons/si';
import ThemeToggle from '../sidebar/ThemeToggle';
import ShowTokenAmount from '../token/ShowTokenAmount';

const AIPersonas = [
	{
		key: 'CHATGPT',
		name: 'ChatGPT',
		role: 'AI Assistant',
		icon: SiOpenai,
		color: 'from-green-400 to-blue-500',
	},
	{
		key: 'DALLE',
		name: 'DALL-E',
		role: 'Image Generator',
		icon: FaImage,
		color: 'from-purple-400 to-pink-500',
	},
	{
		key: 'CLAUDE',
		name: 'Claude',
		role: 'AI Assistant',
		icon: FaRobot,
		color: 'from-yellow-400 to-orange-500',
	},
	{
		key: 'JINA',
		name: 'Jina',
		role: 'Doctor',
		icon: FaUserMd,
		color: 'from-red-400 to-pink-500',
	},
	{
		key: 'ALBERTO',
		name: 'Alberto',
		role: 'Engineer',
		icon: FaHardHat,
		color: 'from-blue-400 to-indigo-500',
	},
	{
		key: 'KOOROSH',
		name: 'Koorosh',
		role: 'Developer',
		icon: FaLaptopCode,
		color: 'from-green-400 to-teal-500',
	},
	{
		key: 'SARAH',
		name: 'Sarah',
		role: 'Teacher',
		icon: FaChalkboardTeacher,
		color: 'from-yellow-400 to-red-500',
	},
];

const ModelCard = ({ persona, onSelect }) => {
	const Icon = persona.icon;
	return (
		<motion.div
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
			className={`bg-gradient-to-br ${persona.color} rounded-xl shadow-lg overflow-hidden cursor-pointer`}
			onClick={() => onSelect(persona)}>
			<div className='p-6 flex flex-col items-center text-white'>
				<Icon className='w-16 h-16 mb-4' />
				<h3 className='text-xl font-bold mb-2'>{persona.name}</h3>
				<p className='text-sm opacity-75'>{persona.role}</p>
			</div>
		</motion.div>
	);
};

const ModelSelection = ({ onSelect }) => (
	<div className='min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-8'>
		<div className='max-w-6xl mx-auto'>
			<div className='flex justify-between items-center mb-12'>
				<h1 className='text-4xl font-extrabold text-gray-800 dark:text-white'>
					Choose Your AI Companion
				</h1>
				<div className='flex gap-4 place-items-center'>
					<ShowTokenAmount />
					<ThemeToggle />
				</div>
			</div>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
				{AIPersonas.map((persona) => (
					<ModelCard
						key={persona.key}
						persona={persona}
						onSelect={onSelect}
					/>
				))}
			</div>
		</div>
	</div>
);

export default ModelSelection;
