// MessageInput.js
import React from 'react';
import { IoMdSend } from 'react-icons/io';

const MessageInput = ({ inputText, setInputText, handleSubmit, isPending }) => (
	<form
		onSubmit={handleSubmit}
		className='border-t border-base-300 p-4 bg-base-100'>
		<div className='flex items-center gap-2'>
			<input
				type='text'
				value={inputText}
				onChange={(e) => setInputText(e.target.value)}
				placeholder='Type your message here...'
				className='input input-bordered flex-1'
				disabled={isPending}
			/>
			<button
				type='submit'
				className='btn btn-primary'
				disabled={isPending}>
				<IoMdSend />
			</button>
		</div>
	</form>
);

export default MessageInput;
