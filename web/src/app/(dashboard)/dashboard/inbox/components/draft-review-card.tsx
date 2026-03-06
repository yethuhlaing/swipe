"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Check, X, Pencil, Sparkles } from "lucide-react"
import { DraftEditor } from "./draft-editor"
import type { DraftWithMeta } from "./inbox-types"

interface DraftReviewCardProps {
    draft: DraftWithMeta
    tenantId: string
    onResolved: () => void
}

export function DraftReviewCard({
    draft,
    tenantId,
    onResolved,
}: DraftReviewCardProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [isBusy, setIsBusy] = useState(false)

    async function handleApprove() {
        setIsBusy(true)
        try {
            const { approveDraftAction } = await import("@/actions/inbox")
            const result = await approveDraftAction(tenantId, draft.id)
            if (result.success) {
                onResolved()
            } else {
                console.error(result.error)
            }
        } finally {
            setIsBusy(false)
        }
    }

    async function handleReject() {
        setIsBusy(true)
        try {
            const { rejectDraftAction } = await import("@/actions/inbox")
            const result = await rejectDraftAction(tenantId, draft.id)
            if (result.success) {
                onResolved()
            } else {
                console.error(result.error)
            }
        } finally {
            setIsBusy(false)
        }
    }

    async function handleSaveEdit(editedContent: string) {
        setIsBusy(true)
        try {
            const { approveDraftAction } = await import("@/actions/inbox")
            const result = await approveDraftAction(
                tenantId,
                draft.id,
                editedContent
            )
            if (result.success) {
                onResolved()
            } else {
                console.error(result.error)
            }
        } finally {
            setIsBusy(false)
        }
    }

    if (isEditing) {
        return (
            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
                <CardHeader className="pb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                        <Pencil className="h-4 w-4" />
                        Edit draft
                    </span>
                </CardHeader>
                <CardContent>
                    <DraftEditor
                        initialContent={draft.content}
                        onSave={handleSaveEdit}
                        onCancel={() => setIsEditing(false)}
                    />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <span className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    AI draft
                </span>
                {draft.suggestedStageId && (
                    <span className="text-xs text-muted-foreground">
                        Suggests stage update
                    </span>
                )}
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-sm whitespace-pre-wrap rounded-md bg-background/80 p-3 border">
                    {draft.content}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        size="sm"
                        onClick={handleApprove}
                        disabled={isBusy}
                        className="gap-1.5"
                    >
                        <Check className="h-4 w-4" />
                        Approve & send
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        disabled={isBusy}
                        className="gap-1.5"
                    >
                        <Pencil className="h-4 w-4" />
                        Edit
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleReject}
                        disabled={isBusy}
                        className="gap-1.5 text-muted-foreground hover:text-destructive"
                    >
                        <X className="h-4 w-4" />
                        Reject
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
