"use client";

import { useEffect, useState } from "react";

export function useMounted() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setMounted(true);
    }, []);

    return mounted;
}
