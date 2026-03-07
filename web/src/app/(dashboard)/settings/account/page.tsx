import { redirect } from "next/navigation"
import { getCurrentTenant, getCurrentUser } from "@/lib/session"
import { AccountSettingsForm } from "./components/account-settings-form"

export default async function AccountSettingsPage() {
    const [tenant, currentUser] = await Promise.all([
        getCurrentTenant(),
        getCurrentUser(),
    ])

    if (!tenant || !currentUser) {
        redirect("/dashboard")
    }

    return (
        <div className="space-y-6 px-4 lg:px-6">
            <div>
                <h1 className="text-3xl font-bold">Account Settings</h1>
                <p className="text-muted-foreground">
                    Manage your workspace profile, defaults, and AI confidence settings.
                </p>
            </div>
            <AccountSettingsForm tenant={tenant} user={currentUser} />
        </div>
    )
}
