"use client";

import { UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface UserButtonWrapperProps {
    afterSignOutUrl?: string;
    appearance?: {
        elements?: Record<string, string>;
    };
}

export function UserButtonWrapper({
    afterSignOutUrl = "/",
    appearance,
}: UserButtonWrapperProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Prevent hydration mismatch by not rendering on server
    if (!isMounted) {
        return (
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
        );
    }

    return <UserButton afterSignOutUrl={afterSignOutUrl} appearance={appearance} />;
}
