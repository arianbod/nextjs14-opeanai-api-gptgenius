// lib/discountSpots.js
import { FaGift, FaStar, FaRocket, FaCrown, FaGem } from 'react-icons/fa';

export const discountSpots = [
	{
		key: 'spot1',
		price: 5,
		discountPercentage: 0,
		tokens: 50,
		icon: <FaGift />,
	},
	{
		key: 'spot2',
		price: 20,
		discountPercentage: 15,
		tokens: 200,
		icon: <FaStar />,
	},
	{
		key: 'spot3',
		price: 50,
		discountPercentage: 20,
		tokens: 600,
		icon: <FaRocket />,
	},
	{
		key: 'spot4',
		price: 100,
		discountPercentage: 25,
		tokens: 1300,
		icon: <FaCrown />,
	},
	{
		key: 'spot5',
		price: 250,
		discountPercentage: 40,
		tokens: 3300,
		icon: <FaGem />,
	},
];
