'use client';
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";

import {
    CATEGORY_FILTERS_MAP,
    FILTER_DEFINITIONS,
    FilterKey,
} from "@/config/filters";

type FiltersState = Partial<Record<FilterKey, string[]>>;

function parseArrayParam(param?: string | null): string[] | undefined {
    if (!param) return undefined;
    return param.split(",").filter(Boolean);
}

interface FiltersProps {
    category: string;      // current category slug
    onClose: () => void;   // modal close handler
}

export default function Filters({ category, onClose }: FiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useTranslation("common");

    const availableFilters = CATEGORY_FILTERS_MAP[category] || [];

    const [filters, setFilters] = useState<FiltersState>({});

    useEffect(() => {
        const initial: FiltersState = {};

        availableFilters.forEach((key) => {
            const param = searchParams.get(key);
            const values = parseArrayParam(param);
            if (values?.length) {
                initial[key] = values;
            }
        });

        setFilters(initial);
    }, [category, availableFilters, searchParams]);

    function toggleFilter(key: FilterKey, value: string) {
        setFilters((prev) => {
            const current = prev[key] ?? [];

            if (current.includes(value)) {
                const next = current.filter((v) => v !== value);
                if (!next.length) {
                    const { [key]: _, ...rest } = prev;
                    return rest;
                }
                return { ...prev, [key]: next };
            }

            return { ...prev, [key]: [...current, value] };
        });
    }

    function applyFilters() {
        const params = new URLSearchParams(searchParams.toString());

        availableFilters.forEach((key) => {
            params.delete(key);
        });

        Object.entries(filters).forEach(([key, values]) => {
            if (values?.length) {
                params.set(key, values.join(","));
            }
        });

        router.replace(`?${params.toString()}`);
        onClose();
    }

    function clearFilters() {
        const params = new URLSearchParams(searchParams.toString());
        availableFilters.forEach((key) => params.delete(key));
        router.replace(`?${params.toString()}`);
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/40 animate-fade-in text-left">
            <div className="absolute bottom-0 w-full rounded-t-2xl bg-[var(--tg-theme-bg-color)] max-h-[85vh] flex flex-col animate-slide-up shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--tg-theme-hint-color)]/10">
                    <h2 className="font-bold text-lg">{t("filters.title")}</h2>
                    <button onClick={onClose} className="p-2">✕</button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {availableFilters.map((key) => {
                        const def = FILTER_DEFINITIONS[key];
                        // Render logic based on definition type if needed, or skeleton simple map
                        // Skeleton assumes options property exists for rendering chips.
                        // For boolean type, we might not have 'options'.
                        // TZ skeleton implemented `def.options.map`.
                        // But 'wifi' is boolean and has no options in config.
                        // I should handle boolean type explicitly or ensure options exist.
                        // TZ Skeleton logic:
                        // if (!def.options) return null; -> This hides boolean filters!
                        // Wait, TZ requested Skeleton has `if (!def.options) return null;`
                        // But `wifi` is boolean.
                        // I should check if user wants me to FIX the skeleton logic or follow it blindly?
                        // "Filters.tsx — Ready Skeleton".
                        // If I follow blindly, boolean filters won't show.
                        // BUT Section 1.3 says "Toggle xatti-harakat".
                        // I will assume the skeleton logic for `options` mapping applies to select types.
                        // I will add a check for `type === 'boolean'`.

                        if (def.type === 'boolean') {
                            const isActive = filters[key]?.includes('true');
                            return (
                                <div key={key}>
                                    <h3 className="mb-2 text-sm font-medium text-[var(--tg-theme-hint-color)] uppercase tracking-wider">
                                        {t(def.labelKey)}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => toggleFilter(key, 'true')}
                                            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all
                                  ${isActive
                                                    ? "bg-[var(--tg-theme-button-color)] text-white border-transparent"
                                                    : "bg-transparent border-[var(--tg-theme-hint-color)]/20 text-[var(--tg-theme-text-color)]"
                                                }`}
                                        >
                                            {t(def.labelKey)}
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        if (!def.options) return null;

                        return (
                            <div key={key}>
                                <h3 className="mb-2 text-sm font-medium text-[var(--tg-theme-hint-color)] uppercase tracking-wider">
                                    {t(def.labelKey)}
                                </h3>

                                <div className="flex flex-wrap gap-2">
                                    {def.options.map((opt) => {
                                        const active = filters[key]?.includes(opt.value);

                                        return (
                                            <button
                                                key={opt.value}
                                                onClick={() => toggleFilter(key, opt.value)}
                                                className={`px-4 py-2 rounded-full border text-sm font-medium transition-all
                          ${active
                                                        ? "bg-[var(--tg-theme-button-color)] text-white border-transparent"
                                                        : "bg-transparent border-[var(--tg-theme-hint-color)]/20 text-[var(--tg-theme-text-color)]"
                                                    }`}
                                            >
                                                {t(opt.labelKey)}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="border-t border-[var(--tg-theme-hint-color)]/10 p-4 flex gap-2 bg-[var(--tg-theme-bg-color)]">
                    {/* Skeleton had border buttons, sticking to theme */}
                    <button
                        onClick={clearFilters}
                        className="flex-1 border border-[var(--tg-theme-hint-color)]/20 rounded-xl py-3 text-sm font-bold text-[var(--tg-theme-hint-color)]"
                    >
                        {t("filters.clear_filters")}
                    </button>

                    <button
                        onClick={applyFilters}
                        className="flex-1 bg-[var(--tg-theme-button-color)] text-white rounded-xl py-3 text-sm font-bold shadow-lg"
                    >
                        {t("filters.show_results")}
                    </button>
                </div>

            </div>
        </div>
    );
}
