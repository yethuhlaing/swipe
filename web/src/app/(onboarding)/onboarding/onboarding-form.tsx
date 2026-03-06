"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createTenantAction } from "@/actions/tenant"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function OnboardingForm() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)

    async function submit(formData: FormData) {
        setError(null)
        const result = await createTenantAction(formData)
        if (result.success) {
            router.refresh()
            router.push("/dashboard")
            return
        }
        setError(result.error ?? "Something went wrong")
    }

    return (
        <Card>
            <CardHeader className="pb-4">
                <h2 className="text-lg font-medium">Workspace name</h2>
            </CardHeader>
            <CardContent>
                <form action={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="e.g. Acme Wholesale"
                            required
                            autoFocus
                            className="w-full"
                        />
                    </div>
                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                    <Button type="submit" className="w-full">
                        Continue
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
