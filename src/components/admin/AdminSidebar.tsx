"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    Folders,
    List,
    Filter,
    ShoppingCart,
    FileText,
    Users,
    Shield,
    Settings,
    Activity,
    LogOut,
    Truck
} from 'lucide-react';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';

export function AdminSidebar() {
    const pathname = usePathname();
    const { t } = useAdminLanguage();

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    const menuGroups = [
        {
            title: t('nav.group_catalog'),
            items: [
                { href: '/admin/products', icon: Package, label: t('nav.products') },
                { href: '/admin/categories', icon: Folders, label: t('nav.categories') },
                { href: '/admin/characteristics', icon: List, label: t('nav.characteristics') },
                { href: '/admin/filters', icon: Filter, label: t('nav.filters') },
            ]
        },
        {
            title: t('nav.group_sales'),
            items: [
                { href: '/admin/requests', icon: FileText, label: t('nav.requests') },
                { href: '/admin/orders', icon: ShoppingCart, label: t('nav.orders') },
                // { href: '/admin/delivery', icon: Truck, label: 'Delivery' },
            ]
        },
        {
            title: t('nav.group_users'),
            items: [
                { href: '/admin/users', icon: Users, label: t('nav.users') },
                { href: '/admin/roles', icon: Shield, label: t('nav.roles') },
            ]
        },
        {
            title: t('nav.group_system'),
            items: [
                { href: '/admin/settings', icon: Settings, label: t('nav.settings') },
                { href: '/admin/logs', icon: Activity, label: t('nav.logs') },
            ]
        }
    ];

    return (
        <aside className="w-64 bg-white border-r flex flex-col h-full shadow-sm">
            <div className="p-6 border-b">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {t('nav.admin_panel')}
                </h1>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto custom-scrollbar">
                {/* Dashboard Main Link */}
                <Link
                    href="/admin"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${pathname === '/admin'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    <LayoutDashboard className="w-5 h-5" />
                    {t('nav.dashboard')}
                </Link>

                {menuGroups.map((group, idx) => (
                    <div key={idx}>
                        <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            {group.title}
                        </div>
                        <div className="space-y-1">
                            {group.items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors ${isActive(item.href)
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive(item.href) ? 'text-blue-600' : 'text-gray-400'}`} />
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="p-4 border-t bg-gray-50">
                <form action="/api/auth/logout" method="POST">
                    <button className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors">
                        <LogOut className="w-5 h-5" />
                        {t('nav.logout')}
                    </button>
                </form>
            </div>
        </aside>
    );
}
