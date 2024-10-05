import { useChat } from '@/context/ChatContext';
import React, { useState } from 'react';
import { FaRobot } from 'react-icons/fa';

// const ModelIcon = ({ model }) => {
// 	const IconComponent = model.icon || FaRobot;
// 	return <IconComponent className='w-6 h-6 text-primary' />;
// };

const Header = () => {
	// const [isModelSelectOpen, setIsModelSelectOpen] = useState(false);

	// const handleModelChange = (newModel) => {
	// 	onChangeModel(newModel);
	// 	setIsModelSelectOpen(false);
	// };
	const { activeChat } = useChat();
	return (
		<header className=' p-4 flex place-items-center place-content-center items-center'>
			<h1 className='text-xl font-semibold text-center flex items-center gap-2'>
				{/* <ModelIcon activeChat={activeChat} /> */}
				<span>{activeChat.name}</span>
				<span className='text-sm'>({activeChat.role})</span>
			</h1>
		</header>
	);
};

export default Header;
