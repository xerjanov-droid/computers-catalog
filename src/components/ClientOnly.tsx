'use client';

import { useMounted } from '@/hooks/useMounted';

export function ClientOnly({ children }: { children: React.ReactNode }) {
    const mounted = useMounted();

    if (!mounted) {
        return (
            <div className="flex h-screen items-center justify-center bg-[var(--tg-theme-secondary-bg-color)]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--tg-theme-button-color)]"></div>
            </div>
        );
    }

    return <>{children}</>;
}
