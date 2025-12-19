import { query } from '@/lib/db';

export default async function AdminDashboard() {
    const stats = {
        products: (await query('SELECT COUNT(*) FROM products')).rows[0].count,
        categories: (await query('SELECT COUNT(*) FROM categories')).rows[0].count,
        requests: (await query('SELECT COUNT(*) FROM b2b_requests')).rows[0].count,
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                    <div className="text-gray-500 text-sm font-medium">Total Products</div>
                    <div className="text-3xl font-bold mt-2">{stats.products}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                    <div className="text-gray-500 text-sm font-medium">Active Categories</div>
                    <div className="text-3xl font-bold mt-2">{stats.categories}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                    <div className="text-gray-500 text-sm font-medium">Pending Requests</div>
                    <div className="text-3xl font-bold mt-2">{stats.requests}</div>
                </div>
            </div>

            <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border">
                <h3 className="text-lg font-bold mb-4">Recent Requests</h3>
                <p className="text-gray-500">No requests yet.</p>
                {/* Implement table here */}
            </div>
        </div>
    );
}
