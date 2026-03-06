import { getCurrentUser, getCurrentTenant } from "@/lib/session"
import { SidebarProvider } from "@/providers/sidebar-provider"
import { SidebarInset } from "@/components/ui/sidebar"
import { Suspense } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"

interface DashboardContainerProps {
    children: React.ReactNode
}

export default async function DashboardLayout({
    children,
}: DashboardContainerProps) {
    const [user, tenant] = await Promise.all([
        getCurrentUser(),
        getCurrentTenant(),
    ])

    return (
        <SidebarProvider>
            <Suspense fallback={<DashboardSidebarSkeleton />}>
                <DashboardSidebar user={user} workspaceName={tenant?.name ?? null} />
            </Suspense>
            <SidebarInset className="no-scrollbar">
                <Suspense fallback={<DashboardHeaderSkeleton />}>
                    <DashboardHeader user={user} />
                </Suspense>
                <main className="@container/main flex min-h-0 flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}

function DashboardSidebarSkeleton() {
    return <div className="w-64 animate-pulse bg-muted" />
}

function DashboardHeaderSkeleton() {
    return <div className="h-16 animate-pulse bg-muted" />
}
