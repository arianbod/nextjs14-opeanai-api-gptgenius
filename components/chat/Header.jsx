import React, { memo } from 'react';
import { useChat } from '@/context/ChatContext';
import { FaRobot } from 'react-icons/fa';
import { Search } from 'lucide-react';

const Header = ({ msgLen = 0 }) => {
	const { activeChat, toggleSearch } = useChat();

	return (
		<header className='fixed top-0 left-0 lg:pl-72 right-0 shadow-md z-30 '>
			<div className='max-w-3xl mx-auto  px-6 pl-10 py-2 flex justify-between items-center'>
				<h1 className='text-xl font-semibold flex items-center gap-2'>
					{/* <FaRobot className='w-6 h-6 text-primary' /> */}
					<span>{activeChat.name}</span>
					<span className='text-sm'>({activeChat.role})</span>
				</h1>
				<button
					onClick={toggleSearch}
					className='p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition'
					title='Search'
					aria-label='Toggle Search'>
					{msgLen > 2 && <Search size={18} />}
				</button>
			</div>
		</header>
	);
};

export default memo(Header);
