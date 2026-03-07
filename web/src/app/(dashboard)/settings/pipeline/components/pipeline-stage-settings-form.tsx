"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { updatePipelineStageAction } from "@/actions/pipeline"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { PipelineStage } from "@/db/schema"

type PipelineStageSettingsFormProps = {
    tenantId: string
    stages: PipelineStage[]
}

type StageActionState = {
    error?: string
    success?: string
}

function StageSaveButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Saving..." : "Save stage"}
        </Button>
    )
}

function StageCard({ stage, tenantId }: { stage: PipelineStage; tenantId: string }) {
    const [state, formAction] = useActionState<StageActionState, FormData>(
        async (_previous, formData) => {
            const result = await updatePipelineStageAction(tenantId, stage.id, formData)
            if (!result.success) {
                return { error: result.error ?? "Failed to update stage." }
            }

            return { success: "Saved." }
        },
        {}
    )

    return (
        <Card>
            <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg">{stage.name}</CardTitle>
                    <Badge variant="secondary">Position {stage.position}</Badge>
                </div>
                <CardDescription>
                    Update display settings and AI threshold for this stage.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="grid gap-4 md:grid-cols-4 md:items-end">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`name-${stage.id}`}>Stage name</Label>
                        <Input
                            id={`name-${stage.id}`}
                            name="name"
                            defaultValue={stage.name}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`color-${stage.id}`}>Color</Label>
                        <Input
                            id={`color-${stage.id}`}
                            name="color"
                            type="color"
                            defaultValue={stage.color ?? "#6366f1"}
                            className="w-14 p-1"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`threshold-${stage.id}`}>AI threshold %</Label>
                        <Input
                            id={`threshold-${stage.id}`}
                            name="aiConfidenceThreshold"
                            type="number"
                            min={0}
                            max={100}
                            defaultValue={stage.aiConfidenceThreshold ?? 75}
                            required
                        />
                    </div>

                    <div className="md:col-span-4 flex items-center gap-3">
                        <StageSaveButton />
                        {state.error ? (
                            <p className="text-sm text-destructive">{state.error}</p>
                        ) : null}
                        {state.success ? (
                            <p className="text-sm text-emerald-600">{state.success}</p>
                        ) : null}
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

export function PipelineStageSettingsForm({
    tenantId,
    stages,
}: PipelineStageSettingsFormProps) {
    if (stages.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>No active pipeline stages</CardTitle>
                    <CardDescription>
                        Add stages from setup before configuring pipeline behavior.
                    </CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {stages.map((stage) => (
                <StageCard key={stage.id} stage={stage} tenantId={tenantId} />
            ))}
        </div>
    )
}
