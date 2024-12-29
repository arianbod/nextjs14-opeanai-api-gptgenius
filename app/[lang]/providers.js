'use client'

import { AuthProvider } from '@/context/AuthContext'
import { ChatProvider } from '@/context/ChatContext'
import { MessageProvider } from '@/context/MessageContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { useState } from 'react'

import { ThemeProvider } from 'next-themes';
import { TranslationsProvider } from '@/context/TranslationContext'
import ErrorBoundary from '@/components/ErrorBoundry'
import { PreferencesProvider } from '@/context/preferencesContext'

const Providers = ({ children, translations, lang }) => {

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
            }
        }
    })

    return (
        // <ErrorBoundary>

        <QueryClientProvider client={queryClient}>

            <MessageProvider>

                <AuthProvider>
                    <PreferencesProvider>

                        <TranslationsProvider translations={translations} lang={lang}>
                            <ChatProvider>
                                <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
                                    {children}
                                </ThemeProvider>
                            </ChatProvider>
                        </TranslationsProvider>
                    </PreferencesProvider>
                </AuthProvider>
            </MessageProvider>
        </QueryClientProvider>
        // </ErrorBoundary>
    )
}

export default Providers