'use client';

import { useServiceWorker } from "../hooks/useServiceWorker";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
    useServiceWorker();
    return <>{children}</>;
}
