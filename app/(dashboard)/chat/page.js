"use client"
import Chat from '@/components/chat/EnhancedChat'
import React from 'react'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
const chatPage = () => {
    const queryClient = new QueryClient()
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Chat />
        </HydrationBoundary>
    )
}

export default chatPage