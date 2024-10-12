'use client'

import { AuthProvider } from '@/context/AuthContext'
import { ChatProvider } from '@/context/ChatContext'
import { MessageProvider } from '@/context/MessageContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import React, { useState } from 'react'

import { ThemeProvider } from 'next-themes';
import { TranslationsProvider } from '@/context/TranslationContext'

const Providers = ({ children, translations }) => {

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

                <AuthProvider>
                    <TranslationsProvider translations={translations}>
                        <ChatProvider>
                            <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
                                {children}
                            </ThemeProvider>
                        </ChatProvider>
                    </TranslationsProvider>
                </AuthProvider>
            </MessageProvider>
        </QueryClientProvider>
    )
}

export default Providers