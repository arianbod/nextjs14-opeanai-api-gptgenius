// components/Modal.jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { FiX } from 'react-icons/fi';

const Modal = ({ children, onClose }) => {
	if (typeof window === 'undefined') return null;

	return ReactDOM.createPortal(
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
			<div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg w-11/12 max-w-md relative p-6'>
				{/* Close Button */}
				<button
					onClick={onClose}
					className='absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition'
					aria-label='Close Modal'>
					<FiX size={20} />
				</button>

				{/* Modal Content */}
				{children}
			</div>
		</div>,
		document.body
	);
};

export default Modal;
