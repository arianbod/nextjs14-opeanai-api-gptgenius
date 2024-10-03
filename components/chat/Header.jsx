import React, { useState } from 'react';
import { FaRobot } from 'react-icons/fa';

const ModelIcon = ({ model }) => {
	const IconComponent = model.icon || FaRobot;
	return <IconComponent className='w-6 h-6 text-primary' />;
};

const Header = ({ selectedPersona, onChangeModel, AIPersonas }) => {
	// const [isModelSelectOpen, setIsModelSelectOpen] = useState(false);

	// const handleModelChange = (newModel) => {
	// 	onChangeModel(newModel);
	// 	setIsModelSelectOpen(false);
	// };

	return (
		<header className='bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 flex justify-between items-center'>
			<h1 className='text-xl font-semibold flex items-center gap-2'>
				<ModelIcon model={selectedPersona} />
				<span>{selectedPersona.name}</span>
				<span className='text-sm text-gray-400'>({selectedPersona.role})</span>
			</h1>
		</header>
	);
};

export default Header;
