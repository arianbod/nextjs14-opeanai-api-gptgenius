"use client"
import EnhancedChat from '@/components/chat/EnhancedChat'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'

const ChatRoom = ({ params }) => {
    const queryClient = new QueryClient()
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <EnhancedChat chatId={params.chatId} />
        </HydrationBoundary>
    )
}

export default ChatRoom