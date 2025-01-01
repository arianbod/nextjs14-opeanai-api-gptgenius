// src/lib/dictionary.js
import { supportedLanguages } from "./supportedLanguages";

const dictionaries = supportedLanguages.reduce((acc, locale) => {
    acc[locale] = () => import(`@/lib/dic/${locale}.json`).then(module => module.default);
    return acc;
}, {});

export const getDictionary = async (locale) => {
    if (!dictionaries[locale]) {
        throw new Error(`Unsupported locale: ${locale}`);
    }
    return dictionaries[locale]();
};
