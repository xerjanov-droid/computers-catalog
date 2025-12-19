"use client";

import { CHARACTERISTICS_SCHEMA_MAP, CharacteristicField } from "@/config/characteristics";
import { Product } from "@/types";
import { useTranslation } from "react-i18next";

interface ProductCharacteristicsProps {
    product: Product;
    fields?: CharacteristicField[];
}

export function ProductCharacteristics({ product, fields }: ProductCharacteristicsProps) {
    const { t } = useTranslation("common");

    // Resolve schema if not provided
    let schema: CharacteristicField[] = fields ?? [];

    if (!fields) {
        // Logic: 
        // 1. Try "category_slug/subcategory_slug"
        // 2. Try "category_slug"
        // 3. Fallback empty
        const schemaKey = product.subcategory_slug
            ? `${product.category_slug}/${product.subcategory_slug}`
            : product.category_slug;

        schema =
            CHARACTERISTICS_SCHEMA_MAP[schemaKey] ??
            CHARACTERISTICS_SCHEMA_MAP[product.category_slug] ??
            [];
    }

    if (!schema || schema.length === 0) {
        return null;
    }

    // Helper to resolve value from specs
    const getValue = (key: string, type: string) => {
        // Prioritize product.specs (JSONB)
        let val = product.specs?.[key];

        if (val === undefined || val === null || val === "") return undefined;

        if (type === 'boolean') {
            return val ? t("yes") : t("no");
        }
        return val;
    };

    return (
        <div className="space-y-1 mt-2">
            {schema.map((field) => {
                const value = getValue(field.key, field.type);
                if (value === undefined) return null;

                return (
                    <div
                        key={field.key}
                        className="flex justify-between text-xs sm:text-sm"
                    >
                        <span className="text-[var(--tg-theme-hint-color)]">
                            {t(field.labelKey)}
                        </span>
                        <span className="font-medium text-[var(--tg-theme-text-color)] text-right">
                            {value}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
