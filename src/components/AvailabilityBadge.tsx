'use client';

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { CheckCircle, Clock, Home } from 'lucide-react';

export interface AvailabilityBadgeProps {
    status: string;
    className?: string;
    showIcon?: boolean;
}

export function AvailabilityBadge({ status, className, showIcon = false }: AvailabilityBadgeProps) {
    const { t } = useTranslation();

    // Map legacy 'pre_order' to 'on_order'
    // TT requires: in_stock | on_order | showroom
    const safeStatus = status === 'pre_order' ? 'on_order' : status;

    const statusColors: Record<string, string> = {
        in_stock: "bg-green-100 text-green-700",
        on_order: "bg-orange-100 text-orange-700",
        showroom: "bg-blue-100 text-blue-700"
    };

    const icons: Record<string, React.ReactNode> = {
        in_stock: <CheckCircle className="w-3.5 h-3.5 mr-1" />,
        on_order: <Clock className="w-3.5 h-3.5 mr-1" />,
        showroom: <Home className="w-3.5 h-3.5 mr-1" />
    };

    // Default to gray if unknown status
    const colorClass = statusColors[safeStatus] || "bg-gray-100 text-gray-700";

    return (
        <span className={cn(
            "px-2 py-1 rounded-full font-bold inline-flex items-center",
            colorClass,
            className
        )}>
            {showIcon && icons[safeStatus]}
            {t(`availability.${safeStatus}`)}
        </span>
    );
}
