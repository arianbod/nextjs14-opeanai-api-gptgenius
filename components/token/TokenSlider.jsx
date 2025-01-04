'use client';

import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaGem, FaCrown, FaRocket } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from '@/context/TranslationContext';
import { toast } from 'react-hot-toast';

// Add Stripe script component
const StripeScript = memo(() => {
	useEffect(() => {
		const script = document.createElement('script');
		script.src = 'https://js.stripe.com/v3/';
		script.async = true;
		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
		};
	}, []);

	return null;
});

// Package options
const packages = [
	{
		id: 'basic',
		name: 'Basic',
		price: 7,
		tokens: 7000,
		icon: FaRocket,
		color: 'from-blue-500 to-blue-600',
	},
	{
		id: 'premium',
		name: 'Premium',
		price: 15,
		tokens: 17000,
		icon: FaCrown,
		color: 'from-purple-500 to-purple-600',
		popular: true,
	},
	{
		id: 'pro',
		name: 'Pro',
		price: 25,
		tokens: 30000,
		icon: FaGem,
		color: 'from-indigo-500 to-indigo-600',
	},
];

const TokenPackage = ({ pkg, selected, onSelect }) => {
	const Icon = pkg.icon;

	return (
		<motion.div
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			className={`relative p-6 rounded-xl cursor-pointer transition-all duration-300 ${
				selected
					? 'bg-gradient-to-r ' + pkg.color + ' text-white shadow-lg'
					: 'bg-white dark:bg-gray-800 hover:shadow-md'
			}`}
			onClick={() => onSelect(pkg)}>
			{pkg.popular && (
				<div className='absolute -top-3 -right-3'>
					<span className='bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs px-3 py-1 rounded-full shadow-md'>
						Popular
					</span>
				</div>
			)}

			<div className='flex flex-col items-center text-center space-y-4'>
				<Icon className='w-8 h-8' />
				<h3 className='text-xl font-bold'>{pkg.name}</h3>
				<div className='text-3xl font-bold'>${pkg.price}</div>
				<div
					className={`text-sm ${
						selected ? 'text-white' : 'text-gray-500 dark:text-gray-400'
					}`}>
					{pkg.tokens.toLocaleString()} Tokens
				</div>
			</div>
		</motion.div>
	);
};

const TokenSlider = ({ isOpen, onClose }) => {
	const { dict } = useTranslations();
	const { user } = useAuth();
	const [selectedPackage, setSelectedPackage] = useState(null);
	const [isProcessing, setIsProcessing] = useState(false);

	// Log component mount and props
	useEffect(() => {
		console.log('Component mounted with props:', { isOpen, user });
	}, [isOpen, user]);

	const handlePayment = async () => {
		console.log('Starting payment process:', {
			selectedPackage: selectedPackage?.id,
			amount: selectedPackage?.price,
			tokens: selectedPackage?.tokens,
		});

		if (!selectedPackage) {
			console.log('No package selected');
			toast.error('Please select a package');
			return;
		}

		if (!user?.userId) {
			console.error('No user ID available');
			toast.error('Authentication error');
			return;
		}

		try {
			setIsProcessing(true);

			console.log('Making API request to create session');

			const response = await fetch('/api/payment/stripe', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					amount: selectedPackage.price,
					userId: user.userId,
					tokenAmount: selectedPackage.tokens,
				}),
			});

			const { sessionId, error } = await response.json();

			if (error) {
				toast.error(error);
				return;
			}

			// Load Stripe with error handling
			const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
			console.log('Initializing Stripe client:', {
				hasKey: !!stripePublicKey,
				keyLength: stripePublicKey?.length,
			});

			if (!stripePublicKey) {
				toast.error('Payment configuration error');
				console.error('Missing Stripe publishable key');
				return;
			}

			const stripe = window.Stripe(stripePublicKey);
			const { error: stripeError } = await stripe.redirectToCheckout({
				sessionId,
			});

			if (stripeError) {
				toast.error(stripeError.message);
			}
		} catch (error) {
			console.error('Payment error:', error);
			toast.error('Payment failed. Please try again.');
		} finally {
			setIsProcessing(false);
		}
	};

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			<StripeScript />
			<motion.div
				className='inset-0 z-50 flex items-center justify-center  bg-opacity-70'
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}>
				<motion.div
					className='rounded-2xl p-8 w-full max-w-4xl  relative'
					initial={{ scale: 0.8 }}
					animate={{ scale: 1 }}
					exit={{ scale: 0.8 }}>
					<div className='text-center mb-8'>
						<h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
							Choose Your Package
						</h2>
						<p className='text-gray-600 dark:text-gray-400'>
							Select the token package that best suits your needs
						</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
						{packages.map((pkg) => (
							<TokenPackage
								key={pkg.id}
								pkg={pkg}
								selected={selectedPackage?.id === pkg.id}
								onSelect={setSelectedPackage}
							/>
						))}
					</div>

					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						onClick={handlePayment}
						disabled={isProcessing || !selectedPackage}
						className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg 
              ${
								selectedPackage
									? 'bg-gradient-to-r ' + selectedPackage.color
									: 'bg-gray-400 cursor-not-allowed'
							} 
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
            `}>
						{isProcessing
							? 'Processing...'
							: selectedPackage
							? `Get ${selectedPackage.tokens.toLocaleString()} Tokens for $${
									selectedPackage.price
							  }`
							: 'Select a Package'}
					</motion.button>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
};

export default memo(TokenSlider);
