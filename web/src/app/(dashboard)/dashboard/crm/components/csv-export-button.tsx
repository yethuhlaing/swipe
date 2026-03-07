"use client"

import { useCallback } from "react"
import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { BuyerWithStage } from "@/lib/dto"

interface CsvExportButtonProps {
    buyers: BuyerWithStage[]
    filename?: string
}

function escapeCsvCell(value: string | null | undefined): string {
    if (value == null) return ""
    const s = String(value)
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
}

function formatDate(date: Date | null | undefined): string {
    if (!date) return ""
    return new Date(date).toISOString()
}

export function CsvExportButton({ buyers, filename = "buyers-export.csv" }: CsvExportButtonProps) {
    const exportCsv = useCallback(() => {
        const headers = [
            "Instagram username",
            "Instagram name",
            "Store name",
            "Email",
            "Stage",
            "Score",
            "Last activity",
            "Tags",
            "Created",
        ]
        const rows = buyers.map((b) => [
            escapeCsvCell(b.instagramUsername),
            escapeCsvCell(b.instagramName),
            escapeCsvCell(b.storeName),
            escapeCsvCell(b.email),
            escapeCsvCell(b.stage?.name),
            b.buyerScore != null ? String(b.buyerScore) : "",
            formatDate(b.lastActivityAt),
            (b.tags as string[] | null)?.length
                ? (b.tags as string[]).map(escapeCsvCell).join("; ")
                : "",
            formatDate(b.createdAt),
        ])
        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
    }, [buyers, filename])

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={exportCsv}
            className="h-8 cursor-pointer"
        >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
        </Button>
    )
}
