import { ProductService } from '@/services/product.service';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Heart, FileText, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductHeader } from '@/components/ProductHeader';

export const dynamic = 'force-dynamic';

export default async function ProductPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const product = await ProductService.getById(Number(id));

    if (!product) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-[var(--tg-theme-bg-color)] pb-24">
            {/* Header */}
            <ProductHeader title={product.title_ru} brand={product.brand} model={product.model} />

            {/* Gallery */}
            <div className="w-full aspect-square bg-white flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
                {product.images && product.images.length > 0 ? (
                    product.images.map((img, idx) => (
                        <div key={idx} className="min-w-full h-full snap-center flex items-center justify-center p-8">
                            <img src={img} alt={product.title_ru} className="max-h-full max-w-full object-contain" />
                        </div>
                    ))
                ) : (
                    <div className="min-w-full h-full flex items-center justify-center text-6xl text-gray-200">
                        🖼️
                    </div>
                )}
            </div>
            {/* Dots indicator could go here */}

            {/* Main Info */}
            <div className="p-4 space-y-4">
                <div>
                    <h1 className="text-xl font-bold leading-snug mb-1">{product.title_ru}</h1>
                    <p className="text-sm text-[var(--tg-theme-hint-color)]">Артикул: {product.sku}</p>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--tg-theme-secondary-bg-color)]">
                    <div className="flex flex-col">
                        <span className="text-xs text-[var(--tg-theme-hint-color)]">Цена</span>
                        <span className="text-2xl font-bold text-[var(--tg-theme-link-color)]">
                            {new Intl.NumberFormat('uz-UZ').format(product.price)} {product.currency}
                        </span>
                    </div>
                    <div className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold",
                        product.status === 'in_stock' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    )}>
                        {product.status === 'in_stock' ? 'В наличии' : 'Под заказ'}
                    </div>
                </div>

                {/* Specs */}
                <div>
                    <h2 className="text-lg font-bold mb-3">Характеристики</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between border-b border-[var(--tg-theme-hint-color)]/10 pb-2">
                            <span className="text-[var(--tg-theme-hint-color)]">Технология</span>
                            <span>{product.technology}</span>
                        </div>
                        <div className="flex justify-between border-b border-[var(--tg-theme-hint-color)]/10 pb-2">
                            <span className="text-[var(--tg-theme-hint-color)]">Формат</span>
                            <span>{product.format}</span>
                        </div>
                        <div className="flex justify-between border-b border-[var(--tg-theme-hint-color)]/10 pb-2">
                            <span className="text-[var(--tg-theme-hint-color)]">Wi-Fi</span>
                            <span>{product.wifi ? 'Есть' : 'Нет'}</span>
                        </div>
                        {product.specs && product.specs.map((spec) => (
                            <div key={spec.id} className="flex justify-between border-b border-[var(--tg-theme-hint-color)]/10 pb-2">
                                <span className="text-[var(--tg-theme-hint-color)]">{spec.spec_key}</span>
                                <span>{spec.spec_value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Documents */}
                {product.files && product.files.length > 0 && (
                    <div>
                        <h2 className="text-lg font-bold mb-3">Документация</h2>
                        <div className="space-y-2">
                            {product.files.map((file) => (
                                <a href={file.file_url} key={file.id} target="_blank" className="flex items-center gap-3 p-3 rounded-xl border border-[var(--tg-theme-hint-color)]/20">
                                    <FileText className="w-5 h-5 text-red-500" />
                                    <span className="flex-1 font-medium text-sm">
                                        {file.file_type === 'manual' ? 'Инструкция (PDF)' : 'Datasheet'}
                                    </span>
                                    <Download className="w-4 h-4 text-[var(--tg-theme-link-color)]" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Buttons */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--tg-theme-bg-color)] border-t border-[var(--tg-theme-hint-color)]/10 flex gap-3 z-20">
                <button className="flex-1 py-3.5 rounded-xl font-bold bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] active:scale-95 transition-transform shadow-lg">
                    Запросить счет
                </button>
                <button className="px-4 rounded-xl bg-[var(--tg-theme-secondary-bg-color)] font-medium text-[var(--tg-theme-link-color)]">
                    Вопрос
                </button>
            </div>
        </main>
    );
}
