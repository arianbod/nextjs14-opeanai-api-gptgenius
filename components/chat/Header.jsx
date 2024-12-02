import React, { memo, useState, useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { Search, X } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ msgLen = 0 }) => {
	const {
		activeChat,
		searchTerm,
		setSearchTerm,
		searchFilter,
		setSearchFilter,
		isSearchOpen,
		toggleSearch,
	} = useChat();

	const searchInputRef = useRef(null);
	const [isExpanded, setIsExpanded] = useState(false);

	useEffect(() => {
		if (isSearchOpen) {
			setIsExpanded(true);
			searchInputRef.current?.focus();
		} else {
			setIsExpanded(false);
		}
	}, [isSearchOpen]);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (isExpanded && !event.target.closest('.search-container')) {
				toggleSearch();
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isExpanded, toggleSearch]);

	return (
		<>
			<AnimatePresence>
				{isExpanded && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className='fixed inset-0 bg-black/20 backdrop-blur-[2px] z-30'
					/>
				)}
			</AnimatePresence>

			<motion.header
				animate={{ height: isExpanded ? '10rem' : '4rem' }}
				className='fixed rounded-b-lg top-0 left-0 lg:pl-72 right-0 shadow-lg z-30 bg-base-200/95 backdrop-blur-xl'>
				<div className='max-w-3xl mx-auto h-full'>
					<motion.div
						className='px-6 py-2 flex justify-between items-center'
						animate={{
							paddingBottom: isExpanded ? '0.5rem' : '0.5rem',
							borderBottom: isExpanded
								? '1px solid rgb(var(--color-base-200) / 0.5)'
								: 'none',
						}}>
						<motion.div
							animate={{
								scale: isExpanded ? 0.9 : 1,
								translateY: isExpanded ? -4 : 0,
							}}
							className=' ml-3 text-xl font-semibold flex items-center gap-2'>
							<Image
								src={activeChat.avatar}
								alt='robot'
								className='rounded-full w-8 h-8'
								width={24}
								height={24}
							/>
							<span>{activeChat.name}</span>
							<span className='text-sm text-base-content/70'>
								({activeChat.role})
							</span>
						</motion.div>

						{msgLen > 2 && (
							<motion.button
								onClick={toggleSearch}
								className='p-2 rounded-full hover:bg-blue-200/50 transition-colors'
								title='Search'
								aria-label='Toggle Search'
								animate={{
									rotate: isExpanded ? 90 : 0,
									scale: isExpanded ? 0.9 : 1,
								}}>
								{isExpanded ? <X size={18} /> : <Search size={18} />}
							</motion.button>
						)}
					</motion.div>

					<AnimatePresence>
						{isExpanded && (
							<motion.div
								initial={{ opacity: 0, y: -20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.2 }}
								className='search-container px-6 py-2'>
								<div className='relative'>
									<div className='relative flex items-center'>
										<Search
											className='absolute left-4 text-base-content/30'
											size={16}
										/>
										<input
											ref={searchInputRef}
											type='text'
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											placeholder='Search in conversation...'
											className='w-full p-2 mb-2 pl-11 rounded-xl bg-base-100 border-none ring-1 ring-base-200 focus:ring-2 focus:ring-primary/30 focus:bg-base-200/80 transition-all duration-300 text-base-content/80 placeholder:text-base-content/30'
										/>
									</div>

									<motion.div
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.1 }}
										className='  -translate-y-1/2 flex gap-1'>
										{['all', 'user', 'assistant'].map((filter) => (
											<button
												key={filter}
												onClick={() => setSearchFilter(filter)}
												className={`px-2.5 py-1 text-xs rounded-lg transition-all duration-200 ${
													searchFilter === filter
														? 'bg-primary/20 text-primary ring-1 ring-primary/30'
														: 'hover:bg-base-200/80 text-base-content/50 hover:text-base-content/70'
												}`}>
												{filter.charAt(0).toUpperCase() + filter.slice(1)}
											</button>
										))}
									</motion.div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</motion.header>
		</>
	);
};

export default memo(Header);
