"use client";

import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { Package, ShoppingBag, Truck, Users, Activity, AlertCircle, BarChart as BarChartIcon } from "lucide-react";

interface DashboardStats {
    products: { total: number; in_stock: number; new_today: number };
    requests: { total: number; new: number; active: number; closed: number };
    users: number;
    recent: any[];
}

interface Props {
    stats: DashboardStats;
}

export function DashboardClient({ stats }: Props) {
    const { t } = useAdminLanguage();

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>

            {/* KPI Cards Row 1: Products */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title={t('dashboard.stats.total_products')}
                    value={stats.products.total}
                    icon={Package}
                    color="blue"
                    subtext={`${stats.products.new_today} ${t('dashboard.stats.new_today')}`}
                />
                <StatCard
                    title={t('dashboard.stats.in_stock')}
                    value={stats.products.in_stock}
                    icon={ShoppingBag}
                    color="green"
                    subtext={t('dashboard.stats.ready_delivery')}
                />
                <StatCard
                    title={t('dashboard.stats.b2b_requests')}
                    value={stats.requests.total}
                    icon={Users}
                    color="purple"
                    subtext={`${stats.requests.new} ${t('dashboard.stats.new_pending')}`}
                />
                <StatCard
                    title={t('dashboard.stats.active_deals')}
                    value={stats.requests.active}
                    icon={Activity}
                    color="orange"
                    subtext={t('dashboard.stats.in_progress')}
                />
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">{t('dashboard.recent_requests')}</h2>
                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                            {t('common.actions')}
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3">{t('common.date')}</th>
                                    <th className="px-4 py-3">Client</th>
                                    <th className="px-4 py-3">{t('common.status')}</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {stats.recent.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                                            {t('dashboard.empty_requests')}
                                        </td>
                                    </tr>
                                ) : (
                                    stats.recent.map((req: any) => (
                                        <tr key={req.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {new Date(req.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                {req.client_name || 'Guest'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-600`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-sm">
                                                {req.total_amount ? `$${req.total_amount}` : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Status Breakdown / Quick Actions Placeholder */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">{t('dashboard.quick_actions')}</h2>
                    <div className="space-y-3">
                        <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center gap-3 transition">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                <Package className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-gray-700">{t('common.add_new')} Product</span>
                        </button>
                        <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center gap-3 transition">
                            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                                <Users className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-gray-700">{t('common.add_new')} B2B Request</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, subtext }: any) {
    const colors: any = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 font-medium text-sm">{title}</h3>
                <div className={`p-2 rounded-lg ${colors[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
            <div className="text-xs text-gray-400 font-medium">{subtext}</div>
        </div>
    );
}
