"use client"

import { SidebarProvider as UISidebarProvider } from "@/components/ui/sidebar"
import { ThemeCustomizer, ThemeCustomizerTrigger } from "@/components/theme"
import { useState } from "react"

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [themeCustomizerOpen, setThemeCustomizerOpen] = useState(false)

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
            <ThemeCustomizerTrigger
                onClick={() => setThemeCustomizerOpen(true)}
            />
            <ThemeCustomizer
                open={themeCustomizerOpen}
                onOpenChange={setThemeCustomizerOpen}
            />
        </UISidebarProvider>
    )
}
