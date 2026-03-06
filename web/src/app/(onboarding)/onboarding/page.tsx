import { redirect } from "next/navigation"
import { getCurrentUser, getCurrentTenant } from "@/lib/session"
import { OnboardingForm } from "./onboarding-form"

export default async function OnboardingPage() {
    const user = await getCurrentUser()
    if (!user) {
        redirect("/auth/signin")
    }

    const tenant = await getCurrentTenant()
    if (tenant) {
        redirect("/dashboard")
    }

    return (
        <div className="w-full max-w-md space-y-6 px-4">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight">
                    Create your workspace
                </h1>
                <p className="text-muted-foreground">
                    Give your wholesale brand a name. You can change it later in
                    settings.
                </p>
            </div>
            <OnboardingForm />
        </div>
    )
}
