import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Package, Users, LogOut, LayoutDashboard } from 'lucide-react';
import './../globals.css'; // Ensure globals are applied if not inherited from root (it is)

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    if (!session) {
        redirect('/api/auth/login');
    }
    // If middleware missed it or for deeper security
    // Need to handle /admin/login route which also uses this layout? 
    // Usually login has its own layout or we check path. 
    // Next.js nested layouts: /admin/layout wraps /admin/login.
    // So we must be careful not to redirect endlessly. 
    // Better: /admin/(dashboard)/layout.tsx and /admin/login/page.tsx (no layout or different).

    // For simplicity, I'll check headers or assume middleware did its job. 
    // But strictly, verifying here is good.
    // If I access data here, it effectively verifies.

    return (
        <div className="flex h-screen bg-gray-100 text-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-xl font-medium text-blue-600">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </Link>
                    <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl font-medium text-gray-600">
                        <Package className="w-5 h-5" />
                        Products
                    </Link>
                    <Link href="/admin/categories" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl font-medium text-gray-600">
                        <Users className="w-5 h-5" /> {/* Using Users icon for Requests/Clients maybe */}
                        Requests
                    </Link>
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

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
