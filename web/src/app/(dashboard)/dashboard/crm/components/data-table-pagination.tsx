"use client"

import type { Table } from "@tanstack/react-table"
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface DataTablePaginationProps<TData> {
    table: Table<TData>
    totalRows: number
    pageIndex: number
    pageSize: number
    totalPages: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
}

export function DataTablePagination<TData>({
    table,
    totalRows,
    pageIndex,
    pageSize,
    totalPages,
    onPageChange,
    onPageSizeChange,
}: DataTablePaginationProps<TData>) {
    const start = totalRows === 0 ? 0 : (pageIndex - 1) * pageSize + 1
    const end = Math.min(pageIndex * pageSize, totalRows)

    return (
        <div className="flex items-center justify-between px-2">
            <div className="flex-1 text-sm text-muted-foreground">
                {totalRows > 0 ? (
                    <>
                        {start}–{end} of {totalRows} buyer{totalRows === 1 ? "" : "s"}
                    </>
                ) : (
                    "0 buyers"
                )}
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => onPageSizeChange(Number(value))}
                    >
                        <SelectTrigger className="h-8 w-[70px] cursor-pointer">
                            <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 50, 100].map((size) => (
                                <SelectItem
                                    key={size}
                                    value={`${size}`}
                                    className="cursor-pointer"
                                >
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {pageIndex} of {totalPages || 1}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex cursor-pointer disabled:cursor-not-allowed"
                        onClick={() => onPageChange(1)}
                        disabled={pageIndex <= 1}
                    >
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeft />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0 cursor-pointer disabled:cursor-not-allowed"
                        onClick={() => onPageChange(pageIndex - 1)}
                        disabled={pageIndex <= 1}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0 cursor-pointer disabled:cursor-not-allowed"
                        onClick={() => onPageChange(pageIndex + 1)}
                        disabled={pageIndex >= totalPages}
                    >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex cursor-pointer disabled:cursor-not-allowed"
                        onClick={() => onPageChange(totalPages)}
                        disabled={pageIndex >= totalPages}
                    >
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRight />
                    </Button>
                </div>
            </div>
        </div>
    )
}
