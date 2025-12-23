'use client';

import { Setting } from '@/services/settings.service';

interface Props {
    settings: Setting[];
    onUpdate: (category: string, key: string, value: any) => void;
}

export function SecuritySettings({ settings, onUpdate }: Props) {
    const getSetting = (key: string) => settings.find(s => s.key === key);
    const getValue = (key: string, defaultValue: any = '') => {
        const setting = getSetting(key);
        return setting?.value ?? defaultValue;
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">6️⃣ Security</h2>
                <p className="text-gray-600 mb-6">Xavfsizlik sozlamalari</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session timeout (min)
                    </label>
                    <input
                        type="number"
                        value={getValue('session_timeout_minutes', 60)}
                        onChange={(e) => onUpdate('security', 'session_timeout_minutes', parseInt(e.target.value))}
                        min="5"
                        max="1440"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-sm text-gray-500 mt-2">Foydalanuvchi sessiyasi qancha vaqtda tugaydi</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Login attempt limit
                    </label>
                    <input
                        type="number"
                        value={getValue('login_attempt_limit', 5)}
                        onChange={(e) => onUpdate('security', 'login_attempt_limit', parseInt(e.target.value))}
                        min="3"
                        max="10"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-sm text-gray-500 mt-2">Maksimal noto'g'ri login urinishlari</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                        <strong>2FA</strong> va <strong>Parol policy</strong> keyinroq qo'shiladi
                    </p>
                </div>
            </div>
        </div>
    );
}

