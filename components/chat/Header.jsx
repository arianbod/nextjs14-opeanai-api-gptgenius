import React, { useState } from 'react';
import { FaRobot } from 'react-icons/fa';

const ModelIcon = ({ model }) => {
	const IconComponent = model.icon || FaRobot;
	return <IconComponent className='w-6 h-6 text-primary' />;
};

const Header = ({ selectedPersona, onChangeModel, AIPersonas }) => {
	const [isModelSelectOpen, setIsModelSelectOpen] = useState(false);

	const handleModelChange = (newModel) => {
		onChangeModel(newModel);
		setIsModelSelectOpen(false);
	};

	return (
		<header className='bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 flex justify-between items-center'>
			<h1 className='text-xl font-semibold flex items-center gap-2'>
				<ModelIcon model={selectedPersona} />
				<span>{selectedPersona.name}</span>
				<span className='text-sm text-gray-400'>({selectedPersona.role})</span>
			</h1>
			<div className='relative'>
				{/* <button
					onClick={() => setIsModelSelectOpen(!isModelSelectOpen)}
					className='btn btn-sm btn-outline btn-accent hover:bg-accent-focus transition-colors duration-200'>
					Change AI
				</button> */}
				{isModelSelectOpen && (
					<div className='absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5'>
						<div
							className='py-1'
							role='menu'
							aria-orientation='vertical'
							aria-labelledby='options-menu'>
							{AIPersonas.map((persona) => (
								<button
									key={persona.key}
									onClick={() => handleModelChange(persona)}
									className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left'
									role='menuitem'>
									{persona.name}
								</button>
							))}
						</div>
					</div>
				)}
			</div>
		</header>
	);
};

export default Header;
