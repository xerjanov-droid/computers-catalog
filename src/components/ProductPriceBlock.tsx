"use client";

import { cn } from "@/lib/utils";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { useTranslation } from "react-i18next";

interface ProductPriceBlockProps {
    price: number;
    currency: string;
    status: string;
    className?: string;
}

export function ProductPriceBlock({ price, currency, status, className }: ProductPriceBlockProps) {
    const { t } = useTranslation();

    // Format price with spaces: 10 000 000
    const formattedPrice = new Intl.NumberFormat('uz-UZ', {
        style: 'decimal',
        useGrouping: true
    }).format(price).replace(/,/g, ' ');

    return (
        <div className={cn("flex flex-col gap-2 p-4", className)}>
            <div className="flex items-center gap-3">
                <AvailabilityBadge
                    status={status}
                    className="px-3 py-1.5 rounded-full text-xs font-bold"
                    showIcon={true}
                />
            </div>

            <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-[#111827] tracking-tight">
                        {formattedPrice}
                    </span>
                    <span className="text-xl font-bold text-gray-500">
                        {currency}
                    </span>
                </div>
                <span className="text-xs text-gray-400 font-medium mt-1">
                    {t('product.price_with_vat')}
                </span>
            </div>
        </div>
    );
}
