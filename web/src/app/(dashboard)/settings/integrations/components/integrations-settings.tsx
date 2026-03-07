"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import {
    connectInstagramAction,
    connectShopifyAction,
    disconnectInstagramAction,
    disconnectShopifyAction,
} from "@/actions/tenant"
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
import type { Tenant } from "@/db/schema"

type ActionState = {
    error?: string
    success?: string
}

type IntegrationsSettingsProps = {
    tenant: Tenant
}

function SubmitButton({ pendingLabel, label }: { pendingLabel: string; label: string }) {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending}>
            {pending ? pendingLabel : label}
        </Button>
    )
}

function formatDate(date: Date | null) {
    if (!date) return "Not connected"
    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(date))
}

export function IntegrationsSettings({ tenant }: IntegrationsSettingsProps) {
    const [instagramState, instagramAction] = useActionState<ActionState, FormData>(
        async (_prev, formData) => {
            const mode = formData.get("mode")
            const result =
                mode === "disconnect"
                    ? await disconnectInstagramAction(tenant.id)
                    : await connectInstagramAction(tenant.id, formData)

            if (!result.success) {
                return { error: result.error ?? "Instagram action failed." }
            }
            return {
                success:
                    mode === "disconnect"
                        ? "Instagram disconnected."
                        : "Instagram connected.",
            }
        },
        {}
    )

    const [shopifyState, shopifyAction] = useActionState<ActionState, FormData>(
        async (_prev, formData) => {
            const mode = formData.get("mode")
            const result =
                mode === "disconnect"
                    ? await disconnectShopifyAction(tenant.id)
                    : await connectShopifyAction(tenant.id, formData)

            if (!result.success) {
                return { error: result.error ?? "Shopify action failed." }
            }
            return {
                success:
                    mode === "disconnect"
                        ? "Shopify disconnected."
                        : "Shopify connected.",
            }
        },
        {}
    )

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Instagram
                        <Badge variant={tenant.instagramConnectedAt ? "default" : "secondary"}>
                            {tenant.instagramConnectedAt ? "Connected" : "Not connected"}
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        Connect your Instagram business account to sync inbound DMs.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Last connected: {formatDate(tenant.instagramConnectedAt)}
                    </p>
                    {tenant.instagramBusinessId ? (
                        <p className="text-sm text-muted-foreground">
                            Business ID: {tenant.instagramBusinessId}
                        </p>
                    ) : null}
                    <form action={instagramAction} className="space-y-3">
                        {!tenant.instagramConnectedAt ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="instagramBusinessId">
                                        Instagram business ID
                                    </Label>
                                    <Input
                                        id="instagramBusinessId"
                                        name="instagramBusinessId"
                                        placeholder="17841400000000000"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="instagramAccessToken">
                                        Access token
                                    </Label>
                                    <Input
                                        id="instagramAccessToken"
                                        name="instagramAccessToken"
                                        placeholder="IGQVJ..."
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="instagramTokenExpiresAt">
                                        Token expiry (optional)
                                    </Label>
                                    <Input
                                        id="instagramTokenExpiresAt"
                                        name="instagramTokenExpiresAt"
                                        type="datetime-local"
                                    />
                                </div>
                                <input type="hidden" name="mode" value="connect" />
                                <SubmitButton
                                    pendingLabel="Connecting..."
                                    label="Connect Instagram"
                                />
                            </>
                        ) : (
                            <>
                                <input type="hidden" name="mode" value="disconnect" />
                                <SubmitButton
                                    pendingLabel="Disconnecting..."
                                    label="Disconnect Instagram"
                                />
                            </>
                        )}
                    </form>
                    {instagramState.error ? (
                        <p className="text-sm text-destructive">{instagramState.error}</p>
                    ) : null}
                    {instagramState.success ? (
                        <p className="text-sm text-emerald-600">{instagramState.success}</p>
                    ) : null}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Shopify
                        <Badge variant={tenant.shopifyConnectedAt ? "default" : "secondary"}>
                            {tenant.shopifyConnectedAt ? "Connected" : "Not connected"}
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        Connect your Shopify store to create and track draft orders.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Last connected: {formatDate(tenant.shopifyConnectedAt)}
                    </p>
                    {tenant.shopifyShop ? (
                        <p className="text-sm text-muted-foreground">
                            Shop: {tenant.shopifyShop}
                        </p>
                    ) : null}
                    <form action={shopifyAction} className="space-y-3">
                        {!tenant.shopifyConnectedAt ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="shopifyShop">Shop domain</Label>
                                    <Input
                                        id="shopifyShop"
                                        name="shopifyShop"
                                        placeholder="my-store.myshopify.com"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shopifyAccessToken">Access token</Label>
                                    <Input
                                        id="shopifyAccessToken"
                                        name="shopifyAccessToken"
                                        placeholder="shpat_..."
                                        required
                                    />
                                </div>
                                <input type="hidden" name="mode" value="connect" />
                                <SubmitButton
                                    pendingLabel="Connecting..."
                                    label="Connect Shopify"
                                />
                            </>
                        ) : (
                            <>
                                <input type="hidden" name="mode" value="disconnect" />
                                <SubmitButton
                                    pendingLabel="Disconnecting..."
                                    label="Disconnect Shopify"
                                />
                            </>
                        )}
                    </form>
                    {shopifyState.error ? (
                        <p className="text-sm text-destructive">{shopifyState.error}</p>
                    ) : null}
                    {shopifyState.success ? (
                        <p className="text-sm text-emerald-600">{shopifyState.success}</p>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    )
}
