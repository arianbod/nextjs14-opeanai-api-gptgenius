import React, { useState, useEffect } from 'react';

const AnimatedPlaceholder = ({ sentences, isActive, staticText }) => {
	const [placeholderText, setPlaceholderText] = useState('');
	const [isTyping, setIsTyping] = useState(true);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [currentSentence, setCurrentSentence] = useState(0);

	useEffect(() => {
		if (!isActive) {
			setPlaceholderText(staticText);
			return;
		}

		let timer;
		const currentText = sentences[currentSentence];

		if (isTyping) {
			if (currentIndex < currentText.length) {
				timer = setTimeout(() => {
					setPlaceholderText((prev) => prev + currentText[currentIndex]);
					setCurrentIndex((prev) => prev + 1);
				}, 50); // Slower typing speed
			} else {
				setIsTyping(false);
				timer = setTimeout(() => {
					setIsTyping(false);
				}, 2000); // Pause before erasing
			}
		} else {
			if (placeholderText.length > 0) {
				timer = setTimeout(() => {
					setPlaceholderText((prev) => prev.slice(0, -1));
				}, 100); // Slower erasing speed
			} else {
				setIsTyping(true);
				setCurrentIndex(0);
				setCurrentSentence((prev) => (prev + 1) % sentences.length);
			}
		}

		return () => clearTimeout(timer);
	}, [
		currentIndex,
		isTyping,
		sentences,
		placeholderText,
		isActive,
		staticText,
		currentSentence,
	]);

	return (
		<span className='animated-placeholder text-base-content/50'>
			{placeholderText}
		</span>
	);
};

export default AnimatedPlaceholder;
