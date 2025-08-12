import type { Metadata } from "next";
import "./globals.css";
import { useState, useEffect } from "react";
import axios from "axios";

export const metadata: Metadata = {
    title: "Weather App",
    description: "Simple weather app in Next.js",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}