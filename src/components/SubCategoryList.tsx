'use client';

import { Category } from '@/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface SubCategoryListProps {
    subCategories: Category[];
    parentId: number;
}

export function SubCategoryList({ subCategories, parentId }: SubCategoryListProps) {
    const searchParams = useSearchParams();
    const activeSub = searchParams.get('sub');

    if (!subCategories || subCategories.length === 0) return null;

    return (
        <div className="w-full overflow-x-auto pb-4 pt-1 no-scrollbar flex gap-2 px-4">
            {/* "All" Chip */}
            <Link
                href={`/?category=${parentId}`}
                className={cn(
                    "px-4 py-2 rounded-full text-[13px] font-bold transition-all whitespace-nowrap border shadow-sm",
                    !activeSub
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-700 border-gray-200"
                )}
            >
                Все
            </Link>

            {subCategories.map((sub) => (
                <Link
                    key={sub.id}
                    href={`/?category=${parentId}&sub=${sub.id}`}
                    className={cn(
                        "px-4 py-2 rounded-full text-[13px] font-bold transition-all whitespace-nowrap border shadow-sm",
                        activeSub === String(sub.id)
                            ? "bg-black text-white border-black"
                            : "bg-white text-gray-700 border-gray-200"
                    )}
                >
                    {sub.name_ru}
                </Link>
            ))}
        </div>
    );
}
