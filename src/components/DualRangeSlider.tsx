
"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface DualRangeSliderProps {
    min: number;
    max: number;
    value: [number, number];
    onChange: (value: [number, number]) => void;
    step?: number;
    className?: string;
}

export function DualRangeSlider({
    min,
    max,
    value,
    onChange,
    step = 1,
    className
}: DualRangeSliderProps) {
    const [minVal, setMinVal] = useState(value[0]);
    const [maxVal, setMaxVal] = useState(value[1]);
    const range = useRef<HTMLDivElement>(null);

    // Convert to percentage
    const getPercent = (value: number) => Math.round(((value - min) / (max - min)) * 100);

    // Update state when props change (external control, e.g. inputs)
    useEffect(() => {
        setMinVal(value[0]);
        setMaxVal(value[1]);
    }, [value]);

    useEffect(() => {
        if (range.current) {
            const minPercent = getPercent(minVal);
            const maxPercent = getPercent(maxVal);

            if (range.current) {
                range.current.style.left = `${minPercent}%`;
                range.current.style.width = `${maxPercent - minPercent}%`;
            }
        }
    }, [minVal, maxVal, min, max]);

    return (
        <div className={cn("relative w-full h-10 flex items-center", className)}>
            <input
                type="range"
                min={min}
                max={max}
                value={minVal}
                step={step}
                onChange={(event) => {
                    const value = Math.min(Number(event.target.value), maxVal - 1);
                    setMinVal(value);
                    onChange([value, maxVal]);
                }}
                className={cn(
                    "thumb thumb-z-30 pointer-events-none absolute h-0 w-full outline-none z-30",
                    "appearance-none",
                    "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-gray-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer",
                    "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-gray-200 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:cursor-pointer"
                )}
                style={{ zIndex: minVal > max - 100 ? 50 : 30 }}
            />
            <input
                type="range"
                min={min}
                max={max}
                value={maxVal}
                step={step}
                onChange={(event) => {
                    const value = Math.max(Number(event.target.value), minVal + 1);
                    setMaxVal(value);
                    onChange([minVal, value]);
                }}
                className={cn(
                    "thumb thumb-z-40 pointer-events-none absolute h-0 w-full outline-none z-40",
                    "appearance-none",
                    "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-gray-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer",
                    "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-gray-200 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:cursor-pointer"
                )}
            />

            <div className="relative w-full">
                <div className="absolute h-1.5 w-full rounded bg-gray-200"></div>
                <div
                    ref={range}
                    className="absolute h-1.5 rounded bg-black"
                ></div>
            </div>
        </div>
    );
}
