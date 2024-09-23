import { Children, createContext, useContext, useState } from 'react';
const PrvChatsContext = createContext();
export const usePrvChatsContext = () => useContext(PrvChatsContext);

export const usePrvChatsContextProvider = () => {
	const [chatListTitles, setChatListTitles] = useState({});
	const [chatListContent, setChatListContent] = useState({});

    handleRetrieveData=(data)=>{
        
    }
	const values = {
		chatListTitles,
		setChatListTitles,
		chatListContent,
		setChatListContent,
	};
	return (
		<PrvChatsContext.Provider value={values}>
			{Children}
		</PrvChatsContext.Provider>
	);
};
