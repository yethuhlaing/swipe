"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

interface DraftEditorProps {
    initialContent: string
    onSave: (editedContent: string) => Promise<void>
    onCancel: () => void
}

export function DraftEditor({
    initialContent,
    onSave,
    onCancel,
}: DraftEditorProps) {
    const [content, setContent] = useState(initialContent)
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit() {
        const trimmed = content.trim()
        if (!trimmed) return
        setIsSubmitting(true)
        try {
            await onSave(trimmed)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-3">
            <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Edit your reply..."
                className="min-h-[120px] resize-y text-sm"
                disabled={isSubmitting}
            />
            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !content.trim()}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Sending...
                        </>
                    ) : (
                        "Send"
                    )}
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
            </div>
        </div>
    )
}
