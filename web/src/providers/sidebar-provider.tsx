"use client"

import { SidebarProvider as UISidebarProvider } from "@/components/ui/sidebar"

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    return (
        <UISidebarProvider
            style={
                {
                    "--sidebar-width": "16rem",
                    "--sidebar-width-icon": "3rem",
                    "--header-height": "calc(var(--spacing) * 14)",
                } as React.CSSProperties
            }
        >
            {children}
        </UISidebarProvider>
    )
}
