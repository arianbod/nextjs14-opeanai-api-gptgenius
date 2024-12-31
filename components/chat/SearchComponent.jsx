import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from '@/context/TranslationContext';

const SearchComponent = ({ onSearch, placeholder = 'Search...' }) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const [searchValue, setSearchValue] = useState('');
	const handleSearch = (value) => {
		setSearchValue(value);
		onSearch(value);
	};
	const { isRTL, dict } = useTranslations();
	return (
		<motion.div
			className='sticky top-0 z-20 w-full bg-base-100/95 backdrop-blur-xl overflow-x-hidden'
			initial={{ height: '4rem' }}
			animate={{ height: isExpanded ? '6rem' : '4rem' }}>
			<div className='max-w-4xl mx-auto h-full px-6'>
				<div className='flex items-center place-content-center justify-center h-16 '>
					<motion.h1
						animate={{
							scale: isExpanded ? 0.9 : 1,
							translateY: isExpanded ? -2 : 0,
						}}
						className=' text-lg font-semibold text-base-content text-center ml-4 select-none '>
						{!isExpanded && dict.chatInterface.searchInModels}
					</motion.h1>

					{/* <div className='relative'>
						<motion.div
							className='flex items-center'
							animate={{
								width: isExpanded ? '20rem' : '2.5rem',
							}}
							transition={{ duration: 0.3 }}>
							<input
								type='text'
								value={searchValue}
								onChange={(e) => handleSearch(e.target.value)}
								onFocus={() => setIsExpanded(true)}
								onBlur={() => !searchValue && setIsExpanded(false)}
								placeholder={isExpanded ? placeholder : ''}
								className={`h-10 pl-10 pr-4 rounded-full bg-base-200/50 border-none 
                  ring-1 ring-base-200 focus:ring-2 focus:ring-primary/30 
                  transition-all duration-300 text-base-content/80 
                  placeholder:text-base-content/30 ${
										!isExpanded ? 'cursor-pointer' : ''
									}`}
							/>
							<div className='absolute left-3 top-1/2 -translate-y-1/2'>
								<Search
									size={18}
									className='text-base-content/50'
									onFocus={() => setIsExpanded(true)}
								/>
							</div>
							{searchValue && (
								<button
									onClick={() => handleSearch('')}
									className='absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 
                    hover:text-base-content/70 transition-colors'>
									<X size={16} />
								</button>
							)}
						</motion.div>
					</div> */}
				</div>
			</div>
		</motion.div>
	);
};

export default SearchComponent;
