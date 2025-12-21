
import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Copy, CheckCircle, AlertTriangle } from 'lucide-react';
import { Category } from '@/types';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';

interface CopyCharacteristicsModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetCategoryId: number;
    categories: Category[]; // List of potential source categories
    onSuccess: () => void;
}

export function CopyCharacteristicsModal({ isOpen, onClose, targetCategoryId, categories, onSuccess }: CopyCharacteristicsModalProps) {
    const { t, language } = useAdminLanguage();
    const [sourceCategoryId, setSourceCategoryId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setSourceCategoryId(null);
            setError(null);
            setLoading(false);
        }
    }, [isOpen]);

    const getCategoryName = (c: Category) => (c[`name_${language}` as keyof Category] as string) || c.name_ru || '';

    const handleCopy = async () => {
        if (!sourceCategoryId || !targetCategoryId) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/admin/categories/${targetCategoryId}/copy-characteristics`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceCategoryId: sourceCategoryId,
                })
            });

            if (!res.ok) throw new Error('Failed to copy');

            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError('Failed to copy characteristics. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Copy className="w-5 h-5 text-blue-600" />
                        {t('copy_characteristics')}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                        <p className="text-sm text-yellow-800 font-medium">
                            {t('copy_confirm_title')}
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                            {t('copy_confirm_message')}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Source Category
                            </label>
                            <select
                                className="w-full p-2 border rounded-lg bg-gray-50 text-sm"
                                value={sourceCategoryId || ''}
                                onChange={(e) => setSourceCategoryId(Number(e.target.value) || null)}
                            >
                                <option value="">Select Category...</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{getCategoryName(c)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            {error}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={handleCopy}
                        disabled={!sourceCategoryId || loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Copying...' : 'Copy Characteristics'}
                    </button>
                </div>
            </div>
        </div>
    );
}
