"use client"

import * as React from "react"
import {
    type ColumnDef,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { useRouter, usePathname } from "next/navigation"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings2 } from "lucide-react"
import type { BuyerWithStage } from "@/lib/dto"
import type { PipelineStage } from "@/db/schema"
import { getBuyerTableColumns } from "./buyer-table-columns"
import { BuyerFilters } from "./buyer-filters"
import { DataTablePagination } from "./data-table-pagination"
import { CsvExportButton } from "./csv-export-button"

interface BuyerTableProps {
    buyers: BuyerWithStage[]
    stages: PipelineStage[]
    total: number
    page: number
    pageSize: number
    totalPages: number
    search: string | undefined
    stageId: string | undefined
    selectedTags: string[] | undefined
}

export function BuyerTable({
    buyers,
    stages,
    total,
    page,
    pageSize,
    totalPages,
    search,
    stageId,
    selectedTags,
}: BuyerTableProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

    const columns = React.useMemo(() => getBuyerTableColumns(), [])

    const table = useReactTable({
        data: buyers,
        columns,
        state: { columnVisibility },
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
        pageCount: totalPages,
    })

    const buildParams = React.useCallback(
        (updates: { page?: number; limit?: number }) => {
            const params = new URLSearchParams()
            if (search?.trim()) params.set("search", search.trim())
            if (stageId) params.set("stage", stageId)
            if (selectedTags?.length) params.set("tags", selectedTags.join(","))
            const newPage = updates.page ?? page
            const newLimit = updates.limit ?? pageSize
            if (newPage > 1) params.set("page", String(newPage))
            if (newLimit !== 20) params.set("limit", String(newLimit))
            return params.toString()
        },
        [search, stageId, selectedTags, page, pageSize]
    )

    const onPageChange = React.useCallback(
        (newPage: number) => {
            const qs = buildParams({ page: newPage })
            router.push(qs ? `${pathname}?${qs}` : pathname)
        },
        [pathname, buildParams, router]
    )

    const onPageSizeChange = React.useCallback(
        (newSize: number) => {
            const qs = buildParams({ page: 1, limit: newSize })
            router.push(qs ? `${pathname}?${qs}` : pathname)
        },
        [pathname, buildParams, router]
    )

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <BuyerFilters
                    search={search}
                    stageId={stageId}
                    selectedTags={selectedTags}
                    stages={stages}
                />
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="ml-auto h-8 cursor-pointer"
                            >
                                <Settings2 className="mr-2 h-4 w-4" />
                                Columns
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[150px]">
                            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {table
                                .getAllColumns()
                                .filter(
                                    (col) =>
                                        typeof col.accessorFn !== "undefined" &&
                                        col.getCanHide()
                                )
                                .map((column) => (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize cursor-pointer"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <CsvExportButton buyers={buyers} />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No buyers found. Try adjusting search or filters.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <DataTablePagination
                table={table}
                totalRows={total}
                pageIndex={page}
                pageSize={pageSize}
                totalPages={totalPages}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
            />
        </div>
    )
}
