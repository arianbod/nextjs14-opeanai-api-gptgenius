"use client";
import { use } from "react";
import ChatIdPage from '@/components/chat/ChatIdPage'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'

const page = props => {
    const params = use(props.params);
    const queryClient = new QueryClient()
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ChatIdPage chatId={params.chatId} />
        </HydrationBoundary>
    )
}

export default page