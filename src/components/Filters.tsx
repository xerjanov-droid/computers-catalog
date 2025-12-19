"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { DualRangeSlider } from "./DualRangeSlider";

interface FiltersProps {
    category?: string; // Not used but kept for interface compatibility
    onClose: () => void;
}

const AVAILABILITY_OPTIONS = ['in_stock', 'on_order', 'showroom'];
const MAX_PRICE = 50000000; // Hardcoded max price per TT
const PRICE_STEP = 10000;

export default function Filters({ onClose }: FiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useTranslation();

    const [selected, setSelected] = useState<string[]>([]);

    // Price State
    const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE]);
    const [priceInputFrom, setPriceInputFrom] = useState<string>("");
    const [priceInputTo, setPriceInputTo] = useState<string>("");

    useEffect(() => {
        // Avail
        const param = searchParams.get('availability');
        if (param) {
            setSelected(param.split(',').filter(Boolean));
        } else {
            setSelected([]);
        }

        // Price
        const pFrom = searchParams.get('price_from');
        const pTo = searchParams.get('price_to');

        const newMin = pFrom ? Number(pFrom) : 0;
        const newMax = pTo ? Number(pTo) : MAX_PRICE;

        setPriceRange([newMin, newMax]);
        setPriceInputFrom(pFrom || "");
        setPriceInputTo(pTo || "");

    }, [searchParams]);

    const toggle = (key: string) => {
        setSelected(prev =>
            prev.includes(key)
                ? prev.filter(k => k !== key)
                : [...prev, key]
        );
    };

    const handleSliderChange = (val: [number, number]) => {
        setPriceRange(val);
        setPriceInputFrom(val[0].toString());
        setPriceInputTo(val[1].toString());
    };

    const handleInputChange = (type: 'from' | 'to', value: string) => {
        // Allow empty string for UX
        if (type === 'from') setPriceInputFrom(value);
        else setPriceInputTo(value);

        const numVal = parseInt(value.replace(/\s/g, '')) || 0;

        if (type === 'from') {
            // Don't enforce min > max strictly while typing, allow loose
            setPriceRange([numVal, priceRange[1]]);
        } else {
            setPriceRange([priceRange[0], numVal || MAX_PRICE]);
        }
    };

    const apply = () => {
        const params = new URLSearchParams(searchParams.toString());

        // Avail
        if (selected.length > 0) {
            params.set('availability', selected.join(','));
        } else {
            params.delete('availability');
        }

        // Price
        // Only set if different from default or explicitly set
        // Logic: if input is empty, don't set param (unless previously set?)
        // TT says: if from/to is null -> don't send.

        // Use parsed integer values ensuring valid number
        const finalFrom = parseInt(priceInputFrom.replace(/\s/g, ''));
        const finalTo = parseInt(priceInputTo.replace(/\s/g, ''));

        if (!isNaN(finalFrom) && priceInputFrom !== "") {
            params.set('price_from', finalFrom.toString());
        } else {
            params.delete('price_from');
        }

        if (!isNaN(finalTo) && priceInputTo !== "") {
            params.set('price_to', finalTo.toString());
        } else {
            params.delete('price_to');
        }

        router.replace(`?${params.toString()}`);
        onClose();
    };

    const clear = () => {
        setSelected([]);
        setPriceRange([0, MAX_PRICE]);
        setPriceInputFrom("");
        setPriceInputTo("");
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 animate-fade-in text-left flex flex-col justify-end">
            <div className="w-full rounded-t-2xl bg-[var(--tg-theme-bg-color)] max-h-[85vh] flex flex-col animate-slide-up shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-5 pb-2">
                    <h2 className="font-extrabold text-2xl tracking-tight">{t("filters.title")}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
                    >
                        &times;
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-8 overflow-y-auto">
                    {/* Status Section */}
                    <div>
                        {/* Removed redundant "STATUS" label or made it subtle */}
                        <div className="flex flex-wrap gap-3">
                            {AVAILABILITY_OPTIONS.map((key) => {
                                const active = selected.includes(key);
                                return (
                                    <button
                                        key={key}
                                        onClick={() => toggle(key)}
                                        className={cn(
                                            "flex-1 min-w-[30%] px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 active:scale-95 flex justify-center items-center text-center",
                                            active
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-600 ring-offset-2"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-transparent"
                                        )}
                                    >
                                        {t(`availability.${key}`)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Price Section */}
                    <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t("filters.price_title")}</h3>

                        <div className="flex items-center gap-3">
                            <div className="flex-1 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{t("filters.from")}</span>
                                <input
                                    type="number"
                                    value={priceInputFrom}
                                    onChange={(e) => handleInputChange('from', e.target.value)}
                                    className="w-full pl-8 pr-3 py-3 rounded-xl border-none bg-white shadow-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="0"
                                />
                            </div>
                            <div className="flex-1 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{t("filters.to")}</span>
                                <input
                                    type="number"
                                    value={priceInputTo}
                                    onChange={(e) => handleInputChange('to', e.target.value)}
                                    className="w-full pl-8 pr-3 py-3 rounded-xl border-none bg-white shadow-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder={MAX_PRICE.toString()}
                                />
                            </div>
                        </div>

                        <div className="px-2 pt-2">
                            <DualRangeSlider
                                min={0}
                                max={MAX_PRICE}
                                value={priceRange}
                                step={PRICE_STEP}
                                onChange={handleSliderChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 pt-2 flex gap-3 pb-8 bg-white border-t border-gray-50">
                    <button
                        onClick={clear}
                        className="flex-1 bg-gray-100 text-gray-600 rounded-2xl py-4 text-sm font-bold transition-colors hover:bg-gray-200"
                    >
                        {t("filters.clear")}
                    </button>

                    <button
                        onClick={apply}
                        className="flex-[2] bg-black text-white rounded-2xl py-4 text-sm font-bold shadow-xl active:scale-95 transition-all"
                    >
                        {t("filters.show_results")}
                    </button>
                </div>
            </div>
        </div>
    );
}
