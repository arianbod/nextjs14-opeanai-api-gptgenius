import React from 'react';
import { motion } from 'framer-motion';
import {
	Sparkles,
	Zap,
	Clock,
	Star,
	Image,
	Brain,
	Code,
	Globe,
	MessagesSquare,
} from 'lucide-react';

const CapabilityBadge = ({ type }) => {
	const badges = {
		vision: {
			icon: Image,
			label: 'Vision',
			className: 'bg-purple-500/10 text-purple-500',
		},
		analytical: {
			icon: Brain,
			label: 'Analytical',
			className: 'bg-blue-500/10 text-blue-500',
		},
		coding: {
			icon: Code,
			label: 'Coding',
			className: 'bg-green-500/10 text-green-500',
		},
		chat: {
			icon: MessagesSquare,
			label: 'Chat',
			className: 'bg-yellow-500/10 text-yellow-500',
		},
	};

	const badge = badges[type];
	if (!badge) return null;

	const Icon = badge.icon;

	return (
		<span
			className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
			<Icon className='w-3 h-3' />
			{badge.label}
		</span>
	);
};

const ModelCard = ({ persona, onSelect, isSelected }) => {
	// Clean up the name by removing "with vision" suffix
	const displayName = persona.name.replace(/\s+with\s+vision$/i, '');

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			className={`
        w-full p-4 rounded-xl cursor-pointer
        bg-base-200/50 hover:bg-base-200/80
        border border-base-300
        transition-all duration-200
        ${isSelected ? 'ring-2 ring-primary shadow-lg' : ''}
      `}
			onClick={() => onSelect(persona)}>
			<div className='flex items-center gap-4 flex-col'>
				{/* Avatar */}
				<div className='relative w-16 h-16 flex-shrink-0'>
					<img
						src={persona.avatar || '/images/babagpt_bw.svg'}
						alt={displayName}
						className='w-full h-full rounded-lg object-cover'
					/>
					{persona.isNew && (
						<div className='absolute -top-2 -right-2'>
							<Sparkles className='w-5 h-5 text-primary' />
						</div>
					)}
				</div>

				{/* Content */}
				<div className='flex-grow min-w-0 w-full'>
					<div className='flex mx-auto w-full place-content-center justify-center items-center gap-2 mb-1'>
						<h3 className='text-base font-semibold text-base-content truncate'>
							{displayName}
						</h3>
						{persona.isPro && (
							<span className='px-2 py-0.5 bg-base-100/50 text-blue-500 text-[10px] rounded-full font-medium'>
								PRO
							</span>
						)}
					</div>

					{/* Capability Badges */}
					<div className='flex flex-wrap gap-1 justify-center mb-2'>
						{persona.categories?.map((category) => (
							<CapabilityBadge
								key={category}
								type={category}
							/>
						))}
					</div>

					<div className='flex flex-wrap gap-2 justify-center'>
						{persona.features?.bestFor?.slice(0, 2).map((feature, index) => (
							<span
								key={index}
								className='inline-flex items-center gap-1 px-2 py-1 bg-base-300/50 
                rounded-full text-xs text-base-content/70'>
								<Zap className='w-3 h-3' />
								{feature}
							</span>
						))}
					</div>
				</div>

				{/* Stats/Info */}
				<div className='flex items-center gap-4 mt-2'>
					{persona.rating && (
						<div className='flex items-center gap-1'>
							<Star className='w-4 h-4 text-yellow-500 fill-yellow-500' />
							<span className='text-sm font-medium'>{persona.rating}</span>
						</div>
					)}
					{persona.speed && (
						<div className='flex items-center gap-1 text-base-content/60'>
							<Clock className='w-4 h-4' />
							<span className='text-xs'>{persona.speed}</span>
						</div>
					)}
				</div>
			</div>
		</motion.div>
	);
};

export default ModelCard;
