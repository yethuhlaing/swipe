import { redirect } from "next/navigation"
import { getCurrentUser, getCurrentTenant } from "@/lib/session"

export default async function DashboardSegmentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getCurrentUser()
    if (!user) {
        redirect("/auth/signin")
    }

    const tenant = await getCurrentTenant()
    if (!tenant) {
        redirect("/onboarding")
    }

    return <>{children}</>
}
