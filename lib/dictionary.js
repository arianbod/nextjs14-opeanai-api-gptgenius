// lib/dictionary.js
import 'server-only'

const dictionaries = {
    en: () => import('@/lib/dic/en.json').then(module => module.default),
    fa: () => import('@/lib/dic/fa.json').then(module => module.default),
    ar: () => import('@/lib/dic/ar.json').then(module => module.default),
    tr: () => import('@/lib/dic/tr.json').then(module => module.default),
    gr: () => import('@/lib/dic/gr.json').then(module => module.default),
    it: () => import('@/lib/dic/it.json').then(module => module.default),
    fr: () => import('@/lib/dic/fr.json').then(module => module.default),
    he: () => import('@/lib/dic/he.json').then(module => module.default),
}

export const getDictionary = async (locale) => dictionaries[locale]()