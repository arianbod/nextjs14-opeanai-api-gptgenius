"use client"
import ChatPage from '@/components/chat/ChatPage'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'

const page = ({ params }) => {
    const queryClient = new QueryClient()
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ChatPage chatId={params.chatId} />
        </HydrationBoundary>
    )
}

export default page