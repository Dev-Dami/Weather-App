import type { Metadata } from "next";
import "./globals.css";
import ClientWrapper from "./components/ClientWrapper";

export const metadata: Metadata = {
    title: "Weather App",
    description: "Simple weather app in Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#ffffff" />
            </head>
            <body>
                <ClientWrapper>{children}</ClientWrapper>
            </body>
        </html>
    );
}
