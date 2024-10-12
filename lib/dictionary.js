// lib/dictionary.js
import 'server-only'

const dictionaries = {
    en: () => import('@/lib/dic/en.json').then(module => module.default),
    fa: () => import('@/lib/dic/fa.json').then(module => module.default),
    tr: () => import('@/lib/dic/tr.json').then(module => module.default),
}

export const getDictionary = async (locale) => dictionaries[locale]()