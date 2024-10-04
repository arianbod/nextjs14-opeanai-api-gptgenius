"use client"
import ChatIdPage from '@/components/chat/ChatIdPage'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'

const page = ({ params }) => {
    const queryClient = new QueryClient()
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ChatIdPage chatId={params.chatId} />
        </HydrationBoundary>
    )
}

export default page