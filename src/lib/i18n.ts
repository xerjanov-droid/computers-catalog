import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// In a real app, import these from JSON files
const resources = {
    en: {
        translation: {
            "welcome": "Welcome",
            "search_placeholder": "Search products...",
        }
    },
    ru: {
        translation: {
            "welcome": "Добро пожаловать",
            "search_placeholder": "Поиск товаров...",
        }
    },
    uz: {
        translation: {
            "welcome": "Xush kelibsiz",
            "search_placeholder": "Mahsulotlarni qidirish...",
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "ru", // default language
        fallbackLng: "ru",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
