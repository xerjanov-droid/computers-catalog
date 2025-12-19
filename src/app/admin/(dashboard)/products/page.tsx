import { ProductService } from '@/services/product.service';
import Link from 'next/link';

export default async function AdminProductsPage() {
    // Fetch products (no filters = all)
    const products = await ProductService.getAll({});

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Products</h2>
                <Link href="/admin/products/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                    Add New Product
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-medium text-gray-500">ID</th>
                            <th className="p-4 font-medium text-gray-500">Name</th>
                            <th className="p-4 font-medium text-gray-500">Brand</th>
                            <th className="p-4 font-medium text-gray-500">Price</th>
                            <th className="p-4 font-medium text-gray-500">Status</th>
                            <th className="p-4 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {products.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="p-4">{p.id}</td>
                                <td className="p-4 font-medium">{p.title_ru}</td>
                                <td className="p-4">{p.brand}</td>
                                <td className="p-4">
                                    {new Intl.NumberFormat('uz-UZ').format(p.price)} {p.currency}
                                </td>
                                <td className="p-4">
                                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100">
                                        {p.status}
                                    </span>
                                </td>
                                <td className="p-4 flex gap-2">
                                    <Link href={`/admin/products/${p.id}`} className="text-blue-600 hover:underline">Edit</Link>
                                    <button className="text-red-600 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
