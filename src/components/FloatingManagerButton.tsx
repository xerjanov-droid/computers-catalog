'use client';

import { MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const MANAGER_USERNAME = 'office_manager';

declare global {
    interface Window {
        Telegram?: {
            WebApp: any;
        }
    }
}

export function FloatingManagerButton() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show after some scroll or immediately? TOR says just "Bottom right"
        setIsVisible(true);
    }, []);

    const handleClick = () => {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            window.Telegram.WebApp.openTelegramLink(`https://t.me/${MANAGER_USERNAME}`);
        } else {
            window.open(`https://t.me/${MANAGER_USERNAME}`, '_blank');
        }
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={handleClick}
            className="fixed bottom-6 right-4 z-50 flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-blue-500 to-blue-600 rounded-full shadow-lg text-white animate-bounce-soft hover:scale-105 transition-transform"
            aria-label="Contact Manager"
        >
            <MessageCircle className="w-7 h-7" />
        </button>
    );
}
