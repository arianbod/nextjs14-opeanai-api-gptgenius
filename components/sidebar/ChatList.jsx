'use client';
import React, { useEffect } from 'react';

const ChatList = () => {
	const [chatList, setChatList] = useState({});
	useEffect(() => {
		localStorage.getItem();
	}, []);
	return <div>ChatList</div>;
};

export default ChatList;
