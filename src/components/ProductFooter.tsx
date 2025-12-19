"use client";

import { MessageCircle, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ProductFooter() {
    const { t } = useTranslation();
    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 flex gap-3 z-40 safe-area-bottom pb-6">
            <button className="flex-1 py-4 px-6 rounded-2xl bg-[#007AFF] text-white font-bold text-lg shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                <span>{t('product.request_invoice')}</span>
            </button>

            <button className="flex items-center justify-center aspect-square h-full py-4 px-4 rounded-2xl bg-gray-100 text-gray-600 font-bold active:bg-gray-200 transition-colors">
                <MessageCircle className="w-6 h-6" />
                <span className="sr-only">{t('product.ask_question')}</span>
            </button>
        </div>
    );
}
