import { query } from '@/lib/db';
import { Package, FileText, ShoppingCart, Users } from 'lucide-react';

export default async function AdminDashboard() {
    // Basic stats fetching
    // Handling failures gracefully if default tables empty or error
    let stats = {
        products: { total: 0, in_stock: 0, new_today: 0 },
        requests: { total: 0, new: 0, active: 0, closed: 0 },
        users: 0,
        recent: []
    };

    try {
        const pRes = await query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'in_stock' THEN 1 ELSE 0 END) as in_stock,
                SUM(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 ELSE 0 END) as new_today
            FROM products
        `);

        // Handle B2B Requests if table has status column (migrated)
        // Fallback for pre-migration safety or empty
        const rRes = await query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_req,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as closed
            FROM b2b_requests
        `);

        const recentRes = await query(`
            SELECT id, type, created_at, status FROM b2b_requests ORDER BY created_at DESC LIMIT 5
        `);

        stats = {
            products: {
                total: parseInt(pRes.rows[0].total) || 0,
                in_stock: parseInt(pRes.rows[0].in_stock) || 0,
                new_today: parseInt(pRes.rows[0].new_today) || 0
            },
            requests: {
                total: parseInt(rRes.rows[0].total) || 0,
                new: parseInt(rRes.rows[0].new_req) || 0,
                active: parseInt(rRes.rows[0].active) || 0,
                closed: parseInt(rRes.rows[0].closed) || 0
            },
            users: 0, // Placeholder
            recent: recentRes.rows
        };
    } catch (e) {
        console.error("Dashboard Stats Error (DB might be migrating):", e);
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                    <p className="text-gray-500">Overview of your store performance</p>
                </div>
                <div className="flex gap-3">
                    {/* Quick Actions */}
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                        + Add Product
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Products"
                    value={stats.products.total}
                    sub={`${stats.products.new_today} added today`}
                    icon={Package}
                    color="blue"
                />
                <StatCard
                    title="In Stock"
                    value={stats.products.in_stock}
                    sub="Ready for delivery"
                    icon={ShoppingCart}
                    color="green"
                />
                <StatCard
                    title="B2B Requests"
                    value={stats.requests.total}
                    sub={`${stats.requests.new} new pending`}
                    icon={FileText}
                    color="orange"
                />
                <StatCard
                    title="Active Deals"
                    value={stats.requests.active}
                    sub="In progress"
                    icon={Users}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4">Recent B2B Requests</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-b">
                                    <th className="pb-3 pl-2">ID</th>
                                    <th className="pb-3">Type</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats.recent.length > 0 ? stats.recent.map((req: any) => (
                                    <tr key={req.id} className="hover:bg-gray-50/50 transition">
                                        <td className="py-3 pl-2 text-sm font-medium text-gray-900">#{req.id}</td>
                                        <td className="py-3 text-sm text-gray-600 capitalize">{req.type}</td>
                                        <td className="py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${req.status === 'new' ? 'bg-blue-50 text-blue-700' :
                                                    req.status === 'completed' ? 'bg-green-50 text-green-700' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="py-3 text-sm text-gray-500">
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-gray-400 text-sm">
                                            No requests found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Stats / Distribution */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4">Inventory Status</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">In Stock</span>
                            <span className="font-medium">{stats.products.in_stock}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(stats.products.in_stock / (stats.products.total || 1)) * 100}%` }}></div>
                        </div>

                        {/* More bars logic */}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, sub, icon: Icon, color }: any) {
    const colors = {
        blue: 'text-blue-600 bg-blue-50',
        green: 'text-green-600 bg-green-50',
        orange: 'text-orange-600 bg-orange-50',
        purple: 'text-purple-600 bg-purple-50',
    };
    // @ts-ignore
    const theme = colors[color] || colors.blue;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-3xl font-bold mt-2 text-gray-900">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${theme}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <p className="mt-4 text-sm text-gray-500 flex items-center gap-1">
                {sub}
            </p>
        </div>
    );
}
