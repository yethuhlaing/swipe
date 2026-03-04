"use client"

import { menuSections } from "@/config/menu.config"
import { useSession } from "@/lib/auth-client"
import Link from "next/link"
import { LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MegaMenu() {
    const { data: session } = useSession()
    const user = session?.user

    // If authenticated, show simplified menu with dashboard link
    if (user) {
        return (
            <div className="w-[300px] max-w-[95vw] p-4 sm:p-6 lg:p-8 bg-background">
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Quick Access
                    </h3>
                    <Button
                        variant="outline"
                        asChild
                        className="w-full cursor-pointer"
                    >
                        <Link href="/dashboard">
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            Go to Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        )
    }

    // If not authenticated, show full menu
    return (
        <div className="w-[700px] max-w-[95vw] p-4 sm:p-6 lg:p-8 bg-background">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
                {menuSections.map((section) => (
                    <div key={section.title} className="space-y-4 lg:space-y-6">
                        {/* Section Header */}
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            {section.title}
                        </h3>

                        {/* Section Links */}
                        <div className="space-y-3 lg:space-y-4">
                            {section.items.map((item) => (
                                <a
                                    key={item.title}
                                    href={item.href}
                                    className="group block space-y-1 lg:space-y-2 hover:bg-accent rounded-md p-2 lg:p-3 -mx-2 lg:-mx-3 transition-colors my-0"
                                >
                                    <div className="flex items-center gap-2 lg:gap-3">
                                        <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                            {item.title}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed ml-6 lg:ml-7">
                                        {item.description}
                                    </p>
                                </a>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
