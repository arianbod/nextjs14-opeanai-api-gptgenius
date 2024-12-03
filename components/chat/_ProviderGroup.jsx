import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import ModelCard from './ModelCard';

const ProviderGroup = ({ provider, personas, selectedModel, onSelect }) => {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<div className='mb-8 bg-base-200/30 rounded-2xl overflow-hidden'>
			<button
				onClick={() => setIsExpanded(!isExpanded)}
				className='w-full flex items-center justify-between p-6 hover:bg-base-200/50 
          transition-colors duration-200'>
				<div className='flex items-center gap-4'>
					<div className='relative'>
						<div className='w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center'>
							<span className='text-xl font-bold text-primary'>
								{provider.charAt(0)}
							</span>
						</div>
						<div
							className='absolute -bottom-1 -right-1 w-5 h-5 bg-primary/20 
              rounded-full flex items-center justify-center'>
							<span className='text-xs font-medium text-primary'>
								{personas.length}
							</span>
						</div>
					</div>
					<div className='text-left'>
						<h3 className='text-lg font-semibold text-base-content'>
							{provider} Engine
						</h3>
						<p className='text-sm text-base-content/60'>
							{personas.length} model{personas.length !== 1 ? 's' : ''}{' '}
							available
						</p>
					</div>
				</div>
				<motion.div
					animate={{ rotate: isExpanded ? 180 : 0 }}
					transition={{ duration: 0.2 }}>
					<ChevronDown className='w-5 h-5 text-base-content/50' />
				</motion.div>
			</button>

			<AnimatePresence>
				{isExpanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3 }}>
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 pt-2'>
							{personas.map((persona) => (
								<motion.div
									key={persona.key}
									initial={{ y: 20, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{ duration: 0.3 }}>
									<ModelCard
										persona={persona}
										onSelect={onSelect}
										isSelected={selectedModel?.key === persona.key}
									/>
								</motion.div>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default ProviderGroup;
