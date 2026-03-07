"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { updateTenantAction } from "@/actions/tenant"
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
import type { Tenant } from "@/db/schema"

type FormState = {
    success?: string
    error?: string
}

type AccountSettingsFormProps = {
    tenant: Tenant
    user: {
        id: string
        name: string | null
        email: string
        image: string | null
    }
}

function SaveButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save changes"}
        </Button>
    )
}

export function AccountSettingsForm({ tenant, user }: AccountSettingsFormProps) {
    const [state, formAction] = useActionState<FormState, FormData>(
        async (_previousState, formData) => {
            const result = await updateTenantAction(tenant.id, formData)
            if (!result.success) {
                return { error: result.error ?? "Failed to save settings" }
            }
            return { success: "Account settings updated successfully." }
        },
        {}
    )

    return (
        <form action={formAction} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Workspace Profile</CardTitle>
                    <CardDescription>
                        This information is used across your SWIPE workspace.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Brand name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={tenant.name}
                            placeholder="Your brand name"
                            required
                        />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="ownerName">Owner</Label>
                            <Input
                                id="ownerName"
                                value={user.name ?? "Unnamed user"}
                                disabled
                                readOnly
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ownerEmail">Owner email</Label>
                            <Input
                                id="ownerEmail"
                                value={user.email}
                                disabled
                                readOnly
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Workspace Defaults</CardTitle>
                    <CardDescription>
                        Configure defaults for outreach cadence and AI confidence.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="defaultReorderDays">Default reorder days</Label>
                            <Input
                                id="defaultReorderDays"
                                name="defaultReorderDays"
                                type="number"
                                min={1}
                                max={365}
                                defaultValue={tenant.settings?.defaultReorderDays ?? 30}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="aiConfidenceThreshold">
                                AI confidence threshold (%)
                            </Label>
                            <Input
                                id="aiConfidenceThreshold"
                                name="aiConfidenceThreshold"
                                type="number"
                                min={0}
                                max={100}
                                defaultValue={tenant.settings?.aiConfidenceThreshold ?? 75}
                            />
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="timezone">Timezone</Label>
                            <Input
                                id="timezone"
                                name="timezone"
                                defaultValue={tenant.settings?.timezone ?? "UTC"}
                                placeholder="UTC"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Input
                                id="currency"
                                name="currency"
                                defaultValue={tenant.settings?.currency ?? "USD"}
                                placeholder="USD"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {state.error ? (
                <p className="text-sm text-destructive">{state.error}</p>
            ) : null}
            {state.success ? (
                <p className="text-sm text-emerald-600">{state.success}</p>
            ) : null}

            <SaveButton />
        </form>
    )
}
