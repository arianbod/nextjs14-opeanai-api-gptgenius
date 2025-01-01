'use client'

import { RTL_LANGUAGES } from '@/lib/supportedLanguages';
import React, { createContext, useContext } from 'react'

const TranslationsContext = createContext()

// RTL languages list


export function TranslationsProvider({ children, translations, lang }) {
    const isRTL = RTL_LANGUAGES.includes(lang);

    /**
     * Retrieves a translation string based on a dot-separated key and replaces placeholders with provided variables.
     * @param {string} key - Dot-separated key for nested translation strings (e.g., 'chatInterface.greetings.askAnythingTitle').
     * @param {object} [vars] - An object containing variables to replace in the translation string.
     * @returns {string} - The translated and interpolated string.
     */
    const t = (key, vars) => {
        const keys = key.split('.');
        let string = translations;
        for (let k of keys) {
            string = string[k];
            if (string === undefined) {
                console.warn(`Missing translation for key: ${key}`);
                return key;
            }
        }

        if (typeof string === 'string' && vars) {
            Object.keys(vars).forEach(varKey => {
                const regex = new RegExp(`{${varKey}}`, 'g');
                string = string.replace(regex, vars[varKey]);
            });
        }

        return string;
    }

    return (
        <TranslationsContext.Provider value={{
            dict: translations,
            t,
            isRTL,
            lang
        }}>
            {children}
        </TranslationsContext.Provider>
    )
}

export function useTranslations() {
    const context = useContext(TranslationsContext)
    if (!context) {
        throw new Error('useTranslations must be used within a TranslationsProvider')
    }
    return context
}
