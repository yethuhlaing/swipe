"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addTagAction, removeTagAction } from "@/actions/buyer"
import { X, Plus } from "lucide-react"

interface BuyerTagsProps {
    buyerId: string
    tenantId: string
    tags: string[]
}

export function BuyerTags({ buyerId, tenantId, tags }: BuyerTagsProps) {
    const [newTag, setNewTag] = useState("")
    const [addError, setAddError] = useState<string | null>(null)

    const handleAdd = async () => {
        const tag = newTag.trim().toLowerCase()
        if (!tag) return
        setAddError(null)
        const result = await addTagAction(tenantId, buyerId, tag)
        if (result.success) {
            setNewTag("")
        } else {
            setAddError(result.error ?? "Failed to add tag")
        }
    }

    const handleRemove = async (tag: string) => {
        await removeTagAction(tenantId, buyerId, tag)
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <Label className="text-sm font-medium">Tags</Label>
                {tags.length === 0 && (
                    <span className="text-sm text-muted-foreground">No tags yet</span>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                    <Badge
                        key={tag}
                        variant="secondary"
                        className="gap-1 pr-1 font-normal"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => handleRemove(tag)}
                            className="rounded-full p-0.5 hover:bg-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-ring"
                            aria-label={`Remove tag ${tag}`}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
            </div>
            <div className="flex gap-2 flex-wrap items-end">
                <div className="space-y-1.5 min-w-[180px]">
                    <Label htmlFor="new-tag" className="sr-only">
                        Add tag
                    </Label>
                    <Input
                        id="new-tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault()
                                handleAdd()
                            }
                        }}
                        placeholder="Add tag..."
                        maxLength={50}
                        className="h-9"
                    />
                </div>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAdd}
                    disabled={!newTag.trim()}
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                </Button>
            </div>
            {addError && (
                <p className="text-sm text-destructive">{addError}</p>
            )}
        </div>
    )
}
