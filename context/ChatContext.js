import { createContext, useContext, useState } from "react";

const ChatContext = createContext()



export const ChatProvider = ({ children }) => {
    const [model, setModel] = useState(null)
    const [activeChat, setActiveChat] = useState({ id: 0, title: '' })
    const [messages, setMessages] = useState([])
    const [chatList, setChatList] = useState([])

    // cleanMessages (after a chatId page closed or move somewhere else (or when a newChatId opened)), addNewMessage (after user send a message we only update and add that message not whole thing), 

    const values = { model, setModel, activeChat, setActiveChat, messages, setMessages, chatList, setChatList }
    return (
        <ChatContext.Provider value={values}>
            {children}
        </ChatContext.Provider>

    )
}

export const useChat = () =>  useContext(ChatContext) 