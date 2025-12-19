
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Shield, Package, Folders, List, ShoppingCart, Truck, Settings, Activity, LogOut } from 'lucide-react';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';

export function AdminSidebar() {
    const pathname = usePathname();
    const { t } = useAdminLanguage();

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    const navItems = [
        { href: '/admin', icon: LayoutDashboard, label: t('nav.dashboard'), exact: true },
        { href: '/admin/users', icon: Users, label: 'Users' }, // Add keys later
        { href: '/admin/roles', icon: Shield, label: 'Roles' },
        { href: '/admin/products', icon: Package, label: t('nav.products') },
        { href: '/admin/categories', icon: Folders, label: t('nav.categories') },
        { href: '/admin/characteristics', icon: List, label: 'Characteristics' },
        { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
        { href: '/admin/delivery', icon: Truck, label: 'Delivery' },
        { href: '/admin/settings', icon: Settings, label: 'Settings' },
        { href: '/admin/logs', icon: Activity, label: 'Logs' },
    ];

    return (
        <aside className="w-64 bg-white border-r flex flex-col h-full">
            <div className="p-6">
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                <Link
                    href="/admin"
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl font-medium transition-colors ${pathname === '/admin'
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    <LayoutDashboard className="w-5 h-5" />
                    {t('nav.dashboard')}
                </Link>

                <div className="pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider px-4">
                    Management
                </div>
                {/* ... Simplified for brevity, normally map */}
                <Link href="/admin/products" className={`flex items-center gap-3 px-4 py-2 rounded-xl font-medium ${isActive('/admin/products') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Package className="w-5 h-5" />
                    {t('nav.products')}
                </Link>
                <Link href="/admin/categories" className={`flex items-center gap-3 px-4 py-2 rounded-xl font-medium ${isActive('/admin/categories') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Folders className="w-5 h-5" />
                    {t('nav.categories')}
                </Link>
                {/* Add others similarly or fully map */}
            </nav>

            <div className="p-4 border-t">
                <form action="/api/auth/logout" method="POST">
                    <button className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors">
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </form>
            </div>
        </aside>
    );
}
