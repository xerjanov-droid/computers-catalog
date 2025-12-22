"use client";

import { Product } from "@/types";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

interface CharacteristicField {
    id: number;
    code: string;
    label: {
        uz: string;
        ru: string;
        en: string;
    };
    inputType: string;
    isRequired: boolean;
    isSpec: boolean;
    order: number;
}

interface ProductCharacteristicsProps {
    product: Product;
}

export function ProductCharacteristics({ product }: ProductCharacteristicsProps) {
    const { t, i18n } = useTranslation("common");
    const [fields, setFields] = useState<CharacteristicField[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch specs based on subcategory_id
        // Since product type might not have subcategory_id explicitly if it's a "Product" type from frontend
        // we check category_id (which IS the subcategory in this strict model) or derive it.
        // Assuming product.category_id is the subcategory ID as per strict requirement.

        async function fetchCharacteristics() {
            if (!product.category_id) return;

            setLoading(true);
            try {
                const res = await fetch(`/api/characteristics?subcategoryId=${product.category_id}`);
                if (res.ok) {
                    const json = await res.json();
                    setFields(json.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch characteristics:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchCharacteristics();
    }, [product.category_id]);

    if (loading) return <div className="text-xs text-gray-400">Loading specs...</div>;
    if (!fields || fields.length === 0) {
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

    // Helper to get localized label
    const getLabel = (field: CharacteristicField) => {
        const lang = i18n.language as 'uz' | 'ru' | 'en';
        return field.label[lang] || field.label['ru'] || field.code;
    };

    return (
        <div className="space-y-1 mt-2">
            {fields.map((field) => {
                const value = getValue(field.code, field.inputType);
                if (value === undefined) return null;

                return (
                    <div
                        key={field.code}
                        className="flex justify-between text-xs sm:text-sm"
                    >
                        <span className="text-[var(--tg-theme-hint-color)]">
                            {getLabel(field)}
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
