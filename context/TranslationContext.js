// context/TranslationsContext.js
'use client'

import React, { createContext, useContext } from 'react'

const TranslationsContext = createContext()

export function TranslationsProvider({ children, translations }) {
    return (
        <TranslationsContext.Provider value={translations}>
            {children}
        </TranslationsContext.Provider>
    )
}

export function useTranslations() {
    return useContext(TranslationsContext)
}