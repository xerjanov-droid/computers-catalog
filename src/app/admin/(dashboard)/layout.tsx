
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminLanguageProvider } from '@/contexts/AdminLanguageContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import '../../globals.css';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    if (!session) {
        redirect('/admin/login');
    }

    return (
        <AdminLanguageProvider>
            <div className="flex h-screen bg-gray-100 text-gray-900">
                <AdminSidebar />
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    <AdminHeader />
                    <main className="flex-1 overflow-y-auto p-8">
                        {children}
                    </main>
                </div>
            </div>
        </AdminLanguageProvider>
    );
}
