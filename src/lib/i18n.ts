import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import commonEn from '../locales/en/common.json';
import commonRu from '../locales/ru/common.json';
import commonUz from '../locales/uz/common.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { common: commonEn },
            ru: { common: commonRu },
            uz: { common: commonUz },
        },
        fallbackLng: "uz",
        supportedLngs: ["uz", "ru", "en"],
        ns: ["common"],
        defaultNS: "common",
        interpolation: {
            escapeValue: false,
        },
        detection: {
                // Use a single shared localStorage key so the whole UI uses the same selected language
                order: ['telegram', 'localStorage', 'navigator'],
                caches: ['localStorage'],
                // store & read language under this key so admin and public app can share it
                lookupLocalStorage: 'active_lang',
            }
    });

export default i18n;
