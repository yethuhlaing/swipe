"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { PipelineStage } from "@/db/schema"

interface BuyerFiltersProps {
    search: string | undefined
    stageId: string | undefined
    selectedTags: string[] | undefined
    stages: PipelineStage[]
}

export function BuyerFilters({
    search = "",
    stageId,
    selectedTags = [],
    stages,
}: BuyerFiltersProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [searchInput, setSearchInput] = React.useState(search)
    const [tagsInput, setTagsInput] = React.useState(
        selectedTags.length ? selectedTags.join(", ") : ""
    )

    React.useEffect(() => {
        setSearchInput(search ?? "")
    }, [search])

    React.useEffect(() => {
        setTagsInput(selectedTags?.length ? selectedTags.join(", ") : "")
    }, [selectedTags])

    const buildParams = React.useCallback(
        (updates: {
            search?: string
            stage?: string
            tags?: string[]
            page?: number
            limit?: number
        }) => {
            const params = new URLSearchParams()
            const newSearch = updates.search !== undefined ? updates.search : search
            const newStage = updates.stage !== undefined ? updates.stage : stageId
            const newTags = updates.tags !== undefined ? updates.tags : selectedTags
            const page = updates.page ?? 1
            const limit = updates.limit

            if (newSearch?.trim()) params.set("search", newSearch.trim())
            if (newStage) params.set("stage", newStage)
            if (newTags?.length) params.set("tags", newTags.join(","))
            if (page > 1) params.set("page", String(page))
            if (limit != null) params.set("limit", String(limit))
            return params.toString()
        },
        [search, stageId, selectedTags]
    )

    const applyFilters = React.useCallback(
        (updates: { search?: string; stage?: string; tags?: string[]; page?: number; limit?: number }) => {
            const qs = buildParams(updates)
            router.push(qs ? `${pathname}?${qs}` : pathname)
        },
        [pathname, buildParams, router]
    )

    const onSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const value = searchInput.trim()
        applyFilters({ search: value || undefined, page: 1 })
    }

    const onTagsSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const tags = tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        applyFilters({ tags: tags.length ? tags : undefined, page: 1 })
    }

    const clearFilters = () => {
        setSearchInput("")
        setTagsInput("")
        applyFilters({
            search: undefined,
            stage: undefined,
            tags: undefined,
            page: 1,
        })
    }

    const isFiltered =
        (search?.trim()?.length ?? 0) > 0 ||
        (stageId?.length ?? 0) > 0 ||
        (selectedTags?.length ?? 0) > 0

    return (
        <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={onSearchSubmit} className="flex gap-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search buyers..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="h-8 w-[180px] pl-8 lg:w-[220px] cursor-text"
                    />
                </div>
                <Button type="submit" size="sm" variant="secondary" className="h-8 cursor-pointer">
                    Search
                </Button>
            </form>

            <Select
                value={stageId ?? "all"}
                onValueChange={(value) =>
                    applyFilters({
                        stage: value === "all" ? undefined : value,
                        page: 1,
                    })
                }
            >
                <SelectTrigger className="h-8 w-[160px] cursor-pointer">
                    <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">
                        All stages
                    </SelectItem>
                    {stages.map((s) => (
                        <SelectItem
                            key={s.id}
                            value={s.id}
                            className="cursor-pointer"
                        >
                            {s.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <form onSubmit={onTagsSubmit} className="flex gap-2">
                <Input
                    placeholder="Tags (comma-separated)"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="h-8 w-[180px] cursor-text"
                />
                <Button type="submit" size="sm" variant="secondary" className="h-8 cursor-pointer">
                    Filter tags
                </Button>
            </form>

            {isFiltered && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 px-2 lg:px-3 cursor-pointer"
                >
                    Reset
                    <X className="ml-1 h-4 w-4" />
                </Button>
            )}
        </div>
    )
}
