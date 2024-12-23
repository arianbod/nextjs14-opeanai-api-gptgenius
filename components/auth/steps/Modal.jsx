// AccessibleModal.jsx
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

const AccessibleModal = ({ isOpen, onClose, title, children }) => {
	const modalRef = useRef(null);
	const firstFocusableElement = useRef(null);
	const lastFocusableElement = useRef(null);

	useEffect(() => {
		if (isOpen) {
			// Focus the modal
			modalRef.current.focus();

			// Handle keydown events for accessibility (e.g., Escape to close, Tab to navigate)
			const handleKeyDown = (e) => {
				if (e.key === 'Escape') {
					onClose();
				}
				if (e.key === 'Tab') {
					// Trap focus inside the modal
					if (e.shiftKey) {
						if (document.activeElement === firstFocusableElement.current) {
							e.preventDefault();
							lastFocusableElement.current.focus();
						}
					} else {
						if (document.activeElement === lastFocusableElement.current) {
							e.preventDefault();
							firstFocusableElement.current.focus();
						}
					}
				}
			};

			document.addEventListener('keydown', handleKeyDown);

			return () => {
				document.removeEventListener('keydown', handleKeyDown);
			};
		}
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return ReactDOM.createPortal(
		<div
			className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'
			aria-modal='true'
			role='dialog'
			aria-labelledby='modal-title'
			aria-describedby='modal-description'>
			<div
				className='bg-white dark:bg-gray-800 rounded-lg shadow-lg w-11/12 max-w-md p-6 relative'
				ref={modalRef}
				tabIndex='-1'>
				{/* Close Button */}
				<button
					onClick={onClose}
					className='absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
					aria-label='Close Modal'
					ref={firstFocusableElement}>
					×
				</button>
				{/* Modal Title */}
				{title && (
					<h2
						id='modal-title'
						className='text-xl font-semibold mb-4'>
						{title}
					</h2>
				)}
				{/* Modal Content */}
				<div id='modal-description'>{children}</div>
				{/* Dummy element to trap focus */}
				<button
					onClick={onClose}
					className='hidden'
					ref={lastFocusableElement}>
					Close
				</button>
			</div>
		</div>,
		document.body
	);
};

export default AccessibleModal;
