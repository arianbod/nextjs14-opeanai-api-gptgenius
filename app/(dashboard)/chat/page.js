"use client"
import React from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import EnhancedChat from '@/components/chat/EnhancedChat';

const ChatPage = () => {
    const queryClient = new QueryClient();

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <EnhancedChat />
        </HydrationBoundary>
    );
};

export default ChatPage;