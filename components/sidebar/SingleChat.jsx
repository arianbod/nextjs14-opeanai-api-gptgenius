import Image from 'next/image';
import Link from 'next/link';
import React, { memo } from 'react';

const SingleChat = ({ persona, avatarUrl, chatTitle, chatId }) => {
	return (
		<li>
			<Link
				href={`/chat/${chatId}`}
				className='flex place-items-center rounded-xl hover:bg-base-300 transition w-full justify-between'
				onClick={() => setSidebarOpen(false)}>
				{/* Persona avatar */}
				<div className='flex place-items-center place-content-center w-1/6 h-16 relative rounded-full overflow-hidden'>
					<Image
						src={avatarUrl}
						alt={persona?.name || 'Model Avatar'}
						width={32}
						height={32}
						className='object-cover rounded-full'
					/>
				</div>
				<span className='text-sm font-medium w-5/6'>{chatTitle}</span>
			</Link>
		</li>
	);
};

export default memo(SingleChat);
