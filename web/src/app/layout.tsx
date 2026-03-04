import type { Metadata } from "next"
import "./globals.css"

import { ThemeProvider } from "@/providers/theme-provider"
import { SidebarConfigProvider } from "@/contexts/sidebar-context"
import { inter } from "@/lib/fonts"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
    title: "Shadcn Dashboard",
    description: "A dashboard built with Next.js and shadcn/ui",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html
            lang="en"
            className={`${inter.variable} antialiased no-scrollbar`}
            suppressHydrationWarning
        >
            <body className={inter.className} suppressHydrationWarning>
                <ThemeProvider
                    defaultTheme="light"
                    storageKey="nextjs-ui-theme"
                >
                    <SidebarConfigProvider>{children}</SidebarConfigProvider>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    )
}
