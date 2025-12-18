'use client';

import '@/lib/i18n'; // Init i18n
import { useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
    // Theme logic could go here
    useEffect(() => {
        // telegram theme sync if needed beyond CSS vars
    }, []);

    return (
        <>
            {children}
        </>
    );
}
