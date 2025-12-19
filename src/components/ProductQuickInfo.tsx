"use client";

import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { CharacteristicField } from "@/config/characteristics";
import { Product } from "@/types";

interface ProductQuickInfoProps {
    fields: CharacteristicField[];
    product: Product;
    className?: string;
}

export function ProductQuickInfo({ fields, product, className }: ProductQuickInfoProps) {
    const { t } = useTranslation();

    if (!fields || fields.length === 0) return null;

    // Helper to resolve value - duplicated simplistic logic for now
    const getValue = (key: string, type: string) => {
        let val = product.specs?.[key];
        if (val === undefined || val === null || val === "") return undefined;
        if (type === 'boolean') return val ? t("yes") : t("no");
        return val;
    };

    return (
        <div className={cn("p-4 pt-0", className)}>
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                {t('product.key_specs')}
            </h3>
            <div className="grid grid-cols-1 gap-y-2">
                {fields.map((field) => {
                    const value = getValue(field.key, field.type);
                    if (value === undefined) return null;

                    return (
                        <div key={field.key} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0 border-dashed">
                            <span className="text-sm text-gray-500 font-medium">{t(field.labelKey)}</span>
                            <span className="text-sm text-gray-900 font-bold text-right max-w-[60%] truncate">
                                {String(value)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
