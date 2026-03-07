import { redirect } from "next/navigation"
import { getCurrentTenant } from "@/lib/session"
import { IntegrationsSettings } from "./components/integrations-settings"

export default async function IntegrationsPage() {
    const tenant = await getCurrentTenant()
    if (!tenant) {
        redirect("/dashboard")
    }

    return (
        <div className="space-y-6 px-4 lg:px-6">
            <div>
                <h1 className="text-3xl font-bold">Integrations</h1>
                <p className="text-muted-foreground">
                    Connect or disconnect Instagram and Shopify to power your pipeline automation.
                </p>
            </div>
            <IntegrationsSettings tenant={tenant} />
        </div>
    )
}
