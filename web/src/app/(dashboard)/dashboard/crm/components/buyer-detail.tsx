"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { updateBuyerAction } from "@/actions/buyer"
import { moveBuyerToStageAction } from "@/actions/buyer"
import type { BuyerWithStage } from "@/lib/dto"
import type { PipelineStage } from "@/db/schema"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare } from "lucide-react"

const STORE_TYPES = [
    { value: "boutique", label: "Boutique" },
    { value: "department", label: "Department" },
    { value: "online", label: "Online" },
    { value: "marketplace", label: "Marketplace" },
    { value: "other", label: "Other" },
] as const

const PRICE_TIERS = [
    { value: "tier1", label: "Tier 1" },
    { value: "tier2", label: "Tier 2" },
    { value: "tier3", label: "Tier 3" },
] as const

interface BuyerDetailProps {
    buyer: BuyerWithStage
    stages: PipelineStage[]
    tenantId: string
    notesOnly?: boolean
}

export function BuyerDetail({
    buyer,
    stages,
    tenantId,
    notesOnly = false,
}: BuyerDetailProps) {
    const [updateState, updateFormAction] = useActionState(
        async (_: unknown, formData: FormData) => {
            const result = await updateBuyerAction(tenantId, buyer.id, formData)
            return result.success ? null : result.error ?? "Update failed"
        },
        null as string | null
    )

    const [stageState, stageFormAction] = useActionState(
        async (_: unknown, formData: FormData) => {
            const stageId = formData.get("stageId") as string
            if (!stageId) return null
            const result = await moveBuyerToStageAction(tenantId, buyer.id, stageId)
            return result.success ? null : result.error ?? "Failed to update stage"
        },
        null as string | null
    )

    const displayName =
        buyer.storeName ?? buyer.instagramName ?? buyer.instagramUsername ?? "Unknown"
    const initials = (buyer.instagramUsername ?? displayName).slice(0, 2).toUpperCase()

    if (notesOnly) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Internal notes</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Private notes about this buyer (not visible to them).
                    </p>
                </CardHeader>
                <CardContent>
                    <form action={updateFormAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                defaultValue={buyer.notes ?? ""}
                                placeholder="Add notes..."
                                rows={12}
                                className="resize-y font-mono text-sm"
                            />
                        </div>
                        {updateState && (
                            <p className="text-sm text-destructive">{updateState}</p>
                        )}
                        <Button type="submit">Save notes</Button>
                    </form>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                    <Avatar className="h-14 w-14 rounded-lg">
                        <AvatarImage
                            src={buyer.instagramProfilePic ?? undefined}
                            alt={displayName}
                        />
                        <AvatarFallback className="rounded-lg text-lg">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-xl">
                                {buyer.instagramUsername
                                    ? `@${buyer.instagramUsername}`
                                    : displayName}
                            </CardTitle>
                            {buyer.stage && (
                                <Badge variant="secondary">{buyer.stage.name}</Badge>
                            )}
                            {buyer.buyerScore != null && (
                                <Badge variant="outline">{buyer.buyerScore}/10</Badge>
                            )}
                        </div>
                        {buyer.storeName && (
                            <p className="text-muted-foreground">{buyer.storeName}</p>
                        )}
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            {buyer.lastActivityAt && (
                                <span>
                                    Last activity{" "}
                                    {formatDistanceToNow(new Date(buyer.lastActivityAt), {
                                        addSuffix: true,
                                    })}
                                </span>
                            )}
                            <Button variant="link" className="h-auto p-0 text-sm" asChild>
                                <Link href={`/dashboard/chat?buyer=${buyer.id}`}>
                                    <MessageSquare className="h-4 w-4 mr-1 inline" />
                                    Open thread
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Edit buyer details. Changes are saved when you click Save.
                    </p>
                </CardHeader>
                <CardContent>
                    <form action={updateFormAction} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="storeName">Store name</Label>
                                <Input
                                    id="storeName"
                                    name="storeName"
                                    defaultValue={buyer.storeName ?? ""}
                                    placeholder="Store name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue={buyer.email ?? ""}
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    defaultValue={buyer.phone ?? ""}
                                    placeholder="+1 234 567 8900"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    name="website"
                                    type="url"
                                    defaultValue={buyer.website ?? ""}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    name="location"
                                    defaultValue={buyer.location ?? ""}
                                    placeholder="City, Country"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="storeType">Store type</Label>
                                <select
                                    id="storeType"
                                    name="storeType"
                                    defaultValue={buyer.storeType ?? ""}
                                    className={cn(
                                        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    )}
                                >
                                    <option value="">Select type</option>
                                    {STORE_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="priceTier">Price tier</Label>
                                <select
                                    id="priceTier"
                                    name="priceTier"
                                    defaultValue={buyer.priceTier ?? "tier1"}
                                    className={cn(
                                        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    )}
                                >
                                    {PRICE_TIERS.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reorderDays">Reorder days</Label>
                                <Input
                                    id="reorderDays"
                                    name="reorderDays"
                                    type="number"
                                    min={1}
                                    max={365}
                                    defaultValue={buyer.reorderDays ?? 30}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                defaultValue={buyer.notes ?? ""}
                                placeholder="Internal notes..."
                                rows={3}
                                className="resize-y"
                            />
                        </div>
                        {updateState && (
                            <p className="text-sm text-destructive">{updateState}</p>
                        )}
                        <Button type="submit">Save profile</Button>
                    </form>
                </CardContent>
            </Card>

            {stages.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Pipeline stage</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Move this buyer to a different stage.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form action={stageFormAction} className="flex flex-wrap items-end gap-2">
                            <div className="space-y-2 min-w-[180px]">
                                <Label htmlFor="stageId">Stage</Label>
                                <select
                                    id="stageId"
                                    name="stageId"
                                    defaultValue={buyer.currentStageId ?? ""}
                                    className={cn(
                                        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    )}
                                >
                                    <option value="">Select stage</option>
                                    {stages.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button type="submit" variant="secondary">
                                Update stage
                            </Button>
                            {stageState && (
                                <p className="text-sm text-destructive self-center">
                                    {stageState}
                                </p>
                            )}
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
