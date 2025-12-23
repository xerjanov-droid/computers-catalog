import { ProductForm } from '@/components/ProductForm';
import { Package, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link 
                        href="/admin/products"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Products</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg shadow-green-500/20">
                            <Plus className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Create New Product
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Add a new product to your catalog
                            </p>
                        </div>
                    </div>
                </div>

                <ProductForm />
            </div>
        </div>
    );
}
