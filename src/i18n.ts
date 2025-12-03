import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en/translation.json';
import ptBRTranslation from './locales/pt-BR/translation.json';

const resources = {
    en: {
        translation: enTranslation,
    },
    'pt-BR': {
        translation: ptBRTranslation,
    },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        debug: import.meta.env.DEV, // Enable debug in development

        interpolation: {
            escapeValue: false, // React already safes from xss
        },

        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        }
    });

export default i18n;
