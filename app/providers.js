'use client'

import { MessageProvider } from '@/context/MessageContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import React, { useState } from 'react'
import { Toaster } from 'react-hot-toast'


const Providers = ({ children }) => {

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
            }
        }
    })

    return (
        <QueryClientProvider client={queryClient}>
            <MessageProvider>

                <Toaster position='top-center' />
                {children}
            </MessageProvider>
        </QueryClientProvider>
    )
}

export default Providers