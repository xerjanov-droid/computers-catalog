
"use client";

import { useTranslation } from "react-i18next";
import { FileText, Download, ShieldCheck, Truck, CheckCircle } from 'lucide-react';
import { ProductHeader } from '@/components/ProductHeader';
import { ProductCharacteristics } from '@/components/ProductCharacteristics';
import { ProductPriceBlock } from '@/components/ProductPriceBlock';
import { ProductQuickInfo } from '@/components/ProductQuickInfo';
import { ProductFooter } from '@/components/ProductFooter';
import { Product } from '@/types';
import { useState, useEffect } from 'react';

interface ProductPageContentProps {
    product: Product;
}


export function ProductPageContent({ product }: ProductPageContentProps) {
    const { t, i18n } = useTranslation();
    const [allFields, setAllFields] = useState<any[]>([]);

    useEffect(() => {
        async function fetchCharacteristics() {
            if (!product.category_id) return;
            try {
                const res = await fetch(`/api/characteristics?subcategoryId=${product.category_id}`);
                if (res.ok) {
                    const json = await res.json();

                    // Filter fields that have values in product.specs
                    // The API returns the definition. We join it with product values.
                    const definitions = json.data || [];
                    const withValues = definitions.filter((def: any) => {
                        const val = product.specs?.[def.code];
                        return val !== undefined && val !== null && val !== "";
                    });
                    setAllFields(withValues);
                }
            } catch (err) {
                console.error("Failed to load characteristics", err);
            }
        }
        fetchCharacteristics();
    }, [product.category_id, product.specs]);

    // 3. Split Logic (TT: Max 3 for Key)
    const KEY_SPECS_LIMIT = 3;
    const keySpecs = allFields.slice(0, KEY_SPECS_LIMIT);
    const remainingSpecs = allFields.slice(KEY_SPECS_LIMIT);

    // Helper for rendering values if needed here? 
    // ProductQuickInfo likely takes { key, label, value } or similar.
    // We should ensure the shape matches what ProductQuickInfo expects.
    // Let's assume ProductQuickInfo takes `CharacteristicField[]` and does lookups, OR takes { label, value }.
    // If ProductQuickInfo expects static `CharacteristicField` shape, we need to map our API response to it.

    // API returns: { code, label: {uz,ru,en}, inputType... }
    // ProductQuickInfo likely expects `key`? Let's check ProductQuickInfo later if needed.
    // For now, mapping API `code` to `key` should work if types align.

    return (
        <main className="min-h-screen bg-white pb-32">
            {/* Header */}
            <ProductHeader
                title={product.title_ru}
                brand={product.brand}
                model={product.model}
                status={product.status}
            />

            {/* Gallery Section - 35% height constraint */}
            <div className="relative w-full aspect-[4/3] max-h-[40vh] bg-white flex overflow-x-auto snap-x snap-mandatory no-scrollbar py-4">
                {product.images && product.images.length > 0 ? (
                    product.images.map((img, idx) => (
                        <div key={idx} className="min-w-full h-full snap-center flex items-center justify-center p-6">
                            <img src={img.image_url} alt={product.title_ru} className="h-full w-auto object-contain mix-blend-multiply" />
                        </div>
                    ))
                ) : (
                    <div className="min-w-full h-full flex items-center justify-center flex-col gap-2 text-gray-300 bg-gray-50">
                        <span className="text-6xl">🖼️</span>
                        <span className="text-sm font-medium">No Image</span>
                    </div>
                )}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                    {product.images && product.images.length > 1 && product.images.map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-300 first:bg-black/50" />
                    ))}
                </div>
            </div>

            {/* Status & Price Block */}
            <ProductPriceBlock
                price={product.price}
                currency={product.currency}
                status={product.status}
            />

            {/* Quick Info (Key Specs) - Only if > 0 */}
            <div className="mt-2 text-sm text-gray-500 px-4 pb-2">
                {t('product.article')}: <span className="font-mono text-black">{product.sku}</span>
            </div>

            {keySpecs.length > 0 && (
                <ProductQuickInfo fields={keySpecs} product={product} className="mt-2" />
            )}

            {/* Full Specs Expandable Area (Remaining Specs) - Only if > 0 */}
            {(remainingSpecs.length > 0 || keySpecs.length > 0) && (
                /* We probably want to show ALL specs in the details view if user expands, 
                   OR just remaining. The UI usually duplicates key specs in full list or separates them.
                   Code below used `remainingSpecs`. Let's stick to that or pass all.
                   If we use `active` ProductCharacteristics (which fetches itself), we just pass product 
                   and it will fetch EVERYTHING again? 
                   Actually, ProductCharacteristics fetches ALL specs. 
                   If we want it to show only `remainingSpecs`, we might need to pass `fields` prop.
                   The refactored ProductCharacteristics takes `product` and fetches internally.
                   BUT, we changed it to accept `product` ONLY. 
                   Wait, if I pass `fields` to ProductCharacteristics, does it use them? 
                   Checking my previous refactor... it removed `fields` prop entirely!
                   So `ProductCharacteristics` component will fetch and display ALL.
                   If we want "Remaining Specs" hidden, we have a disconnect.
                   
                   Option A: Update ProductCharacteristics to accept `initialFields` or `filter`.
                   Option B: Just let ProductCharacteristics fetch and show ALL specs there. 
                   Redundancy with key specs is usually fine or desired (Key specs is summary).
                   
                   Let's use Option B for simplicity and consistency. `ProductCharacteristics` handles fetching.
                   We actually don't need `allFields` state here EXCEPT for `ProductQuickInfo`.
                */
                <div className="mt-6 px-4">
                    <details className="group border-t border-b border-gray-100">
                        <summary className="flex items-center justify-between py-4 cursor-pointer list-none text-lg font-bold text-gray-900 marker:hidden">
                            <span>{t('product.all_specs')}</span>
                            <span className="transition-transform group-open:rotate-180">▼</span>
                        </summary>
                        <div className="pb-4 animate-fade-in">
                            {/* We just pass product, it will fetch and render. 
                                Note: This will render ALL specs, including key specs. This is standard. */}
                            <ProductCharacteristics product={product} />
                        </div>
                    </details>
                </div>
            )}

            {/* Documents */}
            {product.files && product.files.length > 0 && (
                <div className="mt-6 px-4">
                    <h3 className="text-lg font-bold mb-3">{t('product.documentation')}</h3>
                    <div className="space-y-2">
                        {product.files.map((file) => (
                            <a href={file.file_url} key={file.id} target="_blank" className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                <FileText className="w-6 h-6 text-red-500" />
                                <div className="flex-1">
                                    <div className="font-bold text-sm text-gray-900">
                                        {file.file_type === 'manual' ? t('product.manual') : t('product.datasheet')}
                                    </div>
                                    <div className="text-xs text-gray-500">PDF • 2.4 MB</div>
                                </div>
                                <Download className="w-5 h-5 text-blue-500" />
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Trust Blocks */}
            <div className="mt-8 px-4 grid grid-cols-2 gap-3 mb-8">
                <div className="flex flex-col gap-1 p-3 rounded-2xl bg-blue-50/50 border border-blue-100/50">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-bold text-gray-700">{t('trust.warranty')}</span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-2xl bg-green-50/50 border border-green-100/50">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-xs font-bold text-gray-700">{t('trust.original')}</span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-2xl bg-gray-50 border border-gray-100 col-span-2 flex-row items-center">
                    <Truck className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="text-xs font-bold text-gray-700">{t('trust.delivery_free')}</span>
                </div>
            </div>

            {/* Sticky Footer */}
            <ProductFooter />
        </main>
    );
}

