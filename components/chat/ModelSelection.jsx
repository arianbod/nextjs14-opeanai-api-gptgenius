import React, { useState, useMemo } from 'react';
import SearchComponent from './SearchComponent';
import { AIPersonas } from '@/lib/Personas';
import { useChat } from '@/context/ChatContext';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Clock, Star } from 'lucide-react';
import PersonaSuggester from './PersonaSuggester';

const ModelCard = ({ persona, onSelect, isSelected }) => {
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
			<div className='flex items-center gap-4'>
				{/* Avatar */}
				<div className='relative w-16 h-16 flex-shrink-0'>
					<img
						src={persona.avatar || '/images/babagpt_bw.svg'}
						alt={persona.name}
						className='w-full h-full rounded-lg object-cover'
					/>
					{persona.isNew && (
						<div className='absolute -top-2 -right-2'>
							<Sparkles className='w-5 h-5 text-primary' />
						</div>
					)}
				</div>

				{/* Content */}
				<div className='flex-grow min-w-0'>
					<div className='flex items-center gap-2 mb-1'>
						<h3 className='text-base font-semibold text-base-content truncate'>
							{persona.name}
						</h3>
						{persona.isPro && (
							<span className='px-2 py-0.5 bg-base-100/10 text-base-200 text-sm rounded-full font-medium'>
								PRO
							</span>
						)}
					</div>

					<p className='text-sm text-base-content/70 line-clamp-2 mb-2'>
						{persona.description}
					</p>

					{/* Tags */}
					<div className='flex flex-wrap gap-2'>
						{persona.features?.bestFor?.slice(0, 3).map((feature, index) => (
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

				{/* Right section - Stats/Info */}
				<div className='flex flex-col items-end gap-2 ml-4'>
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

const ModelSelection = () => {
	const { model, handleModelSelect, chatList } = useChat();
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('all');
	const AvailableAIPersonas = AIPersonas.filter(
		(persona) => persona.showOnModelSelection === true
	);
	// Dynamically get unique categories from personas
	const categories = useMemo(() => {
		const uniqueCategories = new Set();
		// Add 'all' category first
		uniqueCategories.add('all');

		// Collect all categories from personas
		AvailableAIPersonas.forEach((persona) => {
			if (persona.categories && Array.isArray(persona.categories)) {
				persona.categories.forEach((category) =>
					uniqueCategories.add(category)
				);
			}
		});

		// Convert to array of objects with proper formatting
		return Array.from(uniqueCategories).map((category) => ({
			id: category,
			name:
				category === 'all'
					? 'All Models'
					: category.charAt(0).toUpperCase() + category.slice(1),
		}));
	}, []);

	// Filter and sort personas
	const filteredPersonas = useMemo(() => {
		let filtered = AvailableAIPersonas;

		// Apply search filter
		if (searchTerm) {
			const lowerSearch = searchTerm.toLowerCase();
			filtered = filtered.filter(
				(persona) =>
					persona.name.toLowerCase().includes(lowerSearch) ||
					persona.description?.toLowerCase().includes(lowerSearch) ||
					persona.features?.bestFor?.some((feature) =>
						feature.toLowerCase().includes(lowerSearch)
					)
			);
		}

		// Apply category filter
		if (selectedCategory !== 'all') {
			filtered = filtered.filter((persona) =>
				persona.categories?.includes(selectedCategory)
			);
		}

		// Sort by rating and then by name
		return filtered.sort((a, b) => {
			if (a.rating !== b.rating) return b.rating - a.rating;
			return a.name.localeCompare(b.name);
		});
	}, [searchTerm, selectedCategory]);

	// Get recently used models
	const recentModels = useMemo(() => {
		if (!chatList?.length) return [];
		const recentModelIds = new Set();
		const recent = [];

		for (const chat of chatList) {
			// number of last used models to show
			if (recent.length >= 2) break;
			if (!recentModelIds.has(chat.modelCodeName)) {
				const model = AvailableAIPersonas.find(
					(p) => p.modelCodeName === chat.modelCodeName
				);
				if (model) {
					recent.push(model);
					recentModelIds.add(chat.modelCodeName);
				}
			}
		}

		return recent;
	}, [chatList]);

	return (
		<div className='min-h-screen w-full bg-base-100'>
			<SearchComponent
				onSearch={setSearchTerm}
				placeholder='Search by capability, name, or description...'
			/>

			<div className='max-w-4xl mx-auto px-6 py-8'>
				{/* Recent Models */}
				{recentModels.length > 0 &&
					!searchTerm &&
					selectedCategory === 'all' && (
						<div className='mb-8'>
							<h2 className='text-lg font-semibold mb-4 text-base-content'>
								Recent
							</h2>
							<div className='space-y-3'>
								{recentModels.map((persona) => (
									<ModelCard
										key={persona.key}
										persona={persona}
										onSelect={handleModelSelect}
										isSelected={model?.key === persona.key}
									/>
								))}
							</div>
						</div>
					)}
				{/* <hr /> */}
				<PersonaSuggester />
				{/* Categories */}
				<div className='mb-8 overflow-x-auto mx-auto flex place-items-center place-content-center'>
					<div className='flex gap-2 pb-2 flex-wrap select-none place-content-center mx-auto'>
						{categories.map((category) => (
							<button
								key={category.id}
								onClick={() => setSelectedCategory(category.id)}
								className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                  transition-colors duration-200 ${
										selectedCategory === category.id
											? 'bg-base-300'
											: 'bg-base-200 text-base-content/70 hover:bg-base-300'
									}`}>
								{category.name}
							</button>
						))}
					</div>
				</div>

				{/* All Models */}
				<div className='space-y-3'>
					{filteredPersonas.map((persona) => (
						<ModelCard
							key={persona.key}
							persona={persona}
							onSelect={handleModelSelect}
							isSelected={model?.key === persona.key}
						/>
					))}
				</div>

				{/* Empty State */}
				{filteredPersonas.length === 0 && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className='text-center py-12'>
						<p className='text-base-content/60'>
							No models found matching your search.
						</p>
					</motion.div>
				)}
			</div>
		</div>
	);
};

export default ModelSelection;
