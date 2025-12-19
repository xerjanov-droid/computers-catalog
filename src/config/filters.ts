export type FilterType =
    | "multi-select"
    | "single-select"
    | "boolean";

export type FilterKey =
    | "technology"
    | "color"
    | "wifi";

export interface FilterOption {
    value: string;        // DB value
    labelKey: string;     // i18n key
}

export interface FilterDefinition {
    key: FilterKey;
    type: FilterType;
    labelKey: string;           // Section title (i18n)
    options?: FilterOption[];   // For select filters
}

export const FILTER_DEFINITIONS: Record<FilterKey, FilterDefinition> = {
    technology: {
        key: "technology",
        type: "multi-select",
        labelKey: "filters.technology",
        options: [
            { value: "laser", labelKey: "filters.laser" },
            { value: "inkjet", labelKey: "filters.inkjet" },
        ],
    },

    color: {
        key: "color",
        type: "multi-select",
        labelKey: "filters.color",
        options: [
            { value: "color", labelKey: "filters.color_print" },
            { value: "bw", labelKey: "filters.bw" },
        ],
    },

    wifi: {
        key: "wifi",
        type: "boolean",
        labelKey: "filters.wifi",
    },
};

export const CATEGORY_FILTERS_MAP: Record<string, FilterKey[]> = {
    printers: ["technology", "color", "wifi"],
    computers: [],
    laptops: [],
};
