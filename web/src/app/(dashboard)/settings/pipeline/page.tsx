import { redirect } from "next/navigation"
import { getCurrentTenant } from "@/lib/session"
import { listPipelineStages } from "@/data/pipeline"
import { PipelineStageSettingsForm } from "./components/pipeline-stage-settings-form"

export default async function PipelineSettingsPage() {
    const tenant = await getCurrentTenant()
    if (!tenant) {
        redirect("/dashboard")
    }

    const stages = await listPipelineStages(tenant.id)

    return (
        <div className="space-y-6 px-4 lg:px-6">
            <div>
                <h1 className="text-3xl font-bold">Pipeline Configuration</h1>
                <p className="text-muted-foreground">
                    Configure stage names, colors, and AI confidence thresholds
                    for your funnel.
                </p>
            </div>
            <PipelineStageSettingsForm tenantId={tenant.id} stages={stages} />
        </div>
    )
}
