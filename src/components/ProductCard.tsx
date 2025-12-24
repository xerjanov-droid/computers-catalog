'use client';

import { Product } from '@/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ProductCharacteristics } from './ProductCharacteristics';
import { useTranslation } from 'react-i18next';
import { AvailabilityBadge } from './AvailabilityBadge';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { i18n } = useTranslation();

    // Resolve localized title: prefer server-provided `title`, then language-specific fields, then fallback to `title_ru`.
    const lang = (i18n.language || 'ru') as 'ru' | 'uz' | 'en';
    const title = (product as any).title || (product as any)[`title_${lang}`] || product.title_ru;

    return (
        <Link href={`/product/${product.id}`} className="block h-full">
            <div className="bg-[var(--tg-theme-bg-color)] rounded-2xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[var(--tg-theme-hint-color)]/30 relative h-full flex flex-col hover:shadow-md transition-shadow">
                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-10">
                    <AvailabilityBadge status={product.status} className="text-[10px]" />
                </div>

                {/* Image */}
                <div className="aspect-square w-full rounded-lg bg-white p-4 flex items-center justify-center mb-3">
                    {product.images && product.images[0] ? (
                        <img src={product.images[0].image_url} alt={title} className="w-full h-full object-contain" />
                    ) : (
                        <div className="text-4xl text-gray-300">🖼️</div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col pt-2">
                    <p className="text-xs font-medium text-gray-500 mb-1">{product.brand}</p>
                    <h3 className="text-[15px] font-bold leading-snug line-clamp-2 mb-2 flex-1 text-[var(--tg-theme-text-color)]">
                        {title}
                    </h3>

                    {/* Dynamic Characteristics */}
                    <div className="mb-3">
                        <ProductCharacteristics product={product} />
                    </div>

                    <div className="mt-auto pt-3 border-t border-gray-100">
                        <div className="flex flex-col">
                            {product.is_price_visible !== false ? (
                                <>
                                    <span className="text-[10px] text-gray-400 font-medium">Цена</span>
                                    <span className="text-lg font-extrabold text-[var(--tg-theme-button-color)]">
                                        {new Intl.NumberFormat('uz-UZ').format(product.price)} <span className="text-sm font-bold">{product.currency}</span>
                                    </span>
                                </>
                            ) : (
                                <span className="text-sm font-bold text-[var(--tg-theme-button-color)] mt-auto pt-2">
                                    Kelishilgan narxda
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
