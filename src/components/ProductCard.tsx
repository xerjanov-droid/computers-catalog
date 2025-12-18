import { Product } from '@/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <Link href={`/product/${product.id}`} className="block h-full">
            <div className="bg-[var(--tg-theme-bg-color)] rounded-2xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[var(--tg-theme-hint-color)]/30 relative h-full flex flex-col hover:shadow-md transition-shadow">
                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-10">
                    <span className={cn(
                        "text-[10px] px-2 py-1 rounded-full font-bold",
                        product.status === 'in_stock' && "bg-green-100 text-green-700",
                        product.status === 'pre_order' && "bg-yellow-100 text-yellow-700",
                        product.status === 'showroom' && "bg-blue-100 text-blue-700"
                    )}>
                        {product.status === 'in_stock' && '🟢 В наличии'}
                        {product.status === 'pre_order' && `🟡 ${product.delivery_days} дн.`}
                        {product.status === 'showroom' && '🔵 Шоурум'}
                    </span>
                </div>

                {/* Image */}
                <div className="aspect-square w-full rounded-lg bg-white p-4 flex items-center justify-center mb-3">
                    {product.images && product.images[0] ? (
                        <img src={product.images[0]} alt={product.title_ru} className="w-full h-full object-contain" />
                    ) : (
                        <div className="text-4xl text-gray-300">🖼️</div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col pt-2">
                    <p className="text-xs font-medium text-gray-500 mb-1">{product.brand}</p>
                    <h3 className="text-[15px] font-bold leading-snug line-clamp-2 mb-3 flex-1 text-[var(--tg-theme-text-color)]">
                        {product.title_ru}
                    </h3>

                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-medium">Цена</span>
                            <span className="text-lg font-extrabold text-[var(--tg-theme-button-color)]">
                                {new Intl.NumberFormat('uz-UZ').format(product.price)} <span className="text-sm font-bold">{product.currency}</span>
                            </span>
                        </div>
                        <button className="w-10 h-10 rounded-full bg-[var(--tg-theme-button-color)] flex items-center justify-center text-white text-xl shadow-lg active:scale-95 transition-transform">
                            +
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}
