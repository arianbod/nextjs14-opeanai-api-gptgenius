import React from 'react';
import {
	FaRobot,
	FaImage,
	FaUserMd,
	FaHardHat,
	FaLaptopCode,
	FaChalkboardTeacher,
} from 'react-icons/fa';
import { SiOpenai } from 'react-icons/si';

const ModelIcon = ({ model }) => {
	switch (model) {
		case 'ChatGPT':
			return <SiOpenai className='w-6 h-6 text-green-500' />;
		case 'DALL-E':
			return <FaImage className='w-6 h-6 text-purple-500' />;
		case 'Claude':
			return <FaRobot className='w-6 h-6 text-yellow-500' />;
		case 'Jina':
			return <FaUserMd className='w-6 h-6 text-red-500' />;
		case 'Alberto':
			return <FaHardHat className='w-6 h-6 text-blue-500' />;
		case 'Koorosh':
			return <FaLaptopCode className='w-6 h-6 text-teal-500' />;
		case 'Sarah':
			return <FaChalkboardTeacher className='w-6 h-6 text-orange-500' />;
		default:
			return null;
	}
};

const Header = ({ selectedPersona, onChangeModel }) => (
	<header className='bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 flex justify-between items-center'>
		<h1 className='text-xl font-semibold flex items-center gap-2'>
			<ModelIcon model={selectedPersona.name} />
			<span>{selectedPersona.name}</span>
			<span className='text-sm text-gray-400'>({selectedPersona.role})</span>
		</h1>
		<div className='flex items-center gap-4'>
			<button
				onClick={onChangeModel}
				className='btn btn-sm btn-outline btn-accent hover:bg-accent-focus transition-colors duration-200'>
				Change AI
			</button>
		</div>
	</header>
);

export default Header;
