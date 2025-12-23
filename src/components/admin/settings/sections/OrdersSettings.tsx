'use client';

import { Setting } from '@/services/settings.service';

interface Props {
    settings: Setting[];
    onUpdate: (category: string, key: string, value: any) => void;
}

export function OrdersSettings({ settings, onUpdate }: Props) {
    const getSetting = (key: string) => settings.find(s => s.key === key);
    const getValue = (key: string, defaultValue: any = '') => {
        const setting = getSetting(key);
        return setting?.value ?? defaultValue;
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">5️⃣ Orders / B2B Settings</h2>
                <p className="text-gray-600 mb-6">Buyurtmalar va B2B sozlamalari</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default B2B status
                    </label>
                    <select
                        value={getValue('default_b2b_status', 'new')}
                        onChange={(e) => onUpdate('orders', 'default_b2b_status', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={getValue('email_notifications', true)}
                            onChange={(e) => onUpdate('orders', 'email_notifications', e.target.checked)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                            <span className="font-medium text-gray-900">Email notification</span>
                            <p className="text-sm text-gray-500">Email xabarnomalarini yoqish</p>
                        </div>
                    </label>
                </div>

                <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={getValue('admin_notifications', true)}
                            onChange={(e) => onUpdate('orders', 'admin_notifications', e.target.checked)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                            <span className="font-medium text-gray-900">Admin notification</span>
                            <p className="text-sm text-gray-500">Admin panel xabarnomalarini yoqish</p>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
}

