"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { MoreHorizontal } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "./data-table-column-header"
import type { BuyerWithStage } from "@/dto/buyer"

export function getBuyerTableColumns(): ColumnDef<BuyerWithStage>[] {
    return [
        {
            accessorKey: "instagramUsername",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Instagram" />
            ),
            cell: ({ row }) => {
                const b = row.original
                const username = b.instagramUsername ?? "—"
                const name = (b.instagramName ?? b.storeName) || username
                return (
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage
                                src={b.instagramProfilePic ?? undefined}
                                alt={name}
                            />
                            <AvatarFallback className="text-xs">
                                {name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                            <span className="font-medium truncate">
                                {username}
                            </span>
                            {b.instagramName &&
                                b.instagramName !== username && (
                                    <span className="text-xs text-muted-foreground truncate">
                                        {b.instagramName}
                                    </span>
                                )}
                        </div>
                    </div>
                )
            },
            enableSorting: false,
        },
        {
            accessorKey: "storeName",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Store" />
            ),
            cell: ({ row }) => {
                const name = row.getValue("storeName") as string | null
                return (
                    <span className="truncate max-w-[180px] block">
                        {name || "—"}
                    </span>
                )
            },
        },
        {
            id: "stage",
            accessorFn: (row) => row.stage?.name ?? "—",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Stage" />
            ),
            cell: ({ row }) => {
                const stage = row.original.stage
                if (!stage)
                    return <span className="text-muted-foreground">—</span>
                return (
                    <Badge variant="secondary" className="font-normal">
                        {stage.name}
                    </Badge>
                )
            },
            filterFn: (row, id, value) =>
                value ? row.original.currentStageId === value : true,
        },
        {
            accessorKey: "buyerScore",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Score" />
            ),
            cell: ({ row }) => {
                const score = row.getValue("buyerScore") as number | null
                if (score == null)
                    return <span className="text-muted-foreground">—</span>
                return (
                    <span className="tabular-nums font-medium">{score}/10</span>
                )
            },
        },
        {
            accessorKey: "lastActivityAt",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Last activity" />
            ),
            cell: ({ row }) => {
                const date = row.getValue("lastActivityAt") as Date | null
                if (!date)
                    return <span className="text-muted-foreground">—</span>
                return (
                    <span className="text-muted-foreground text-sm">
                        {formatDistanceToNow(new Date(date), {
                            addSuffix: true,
                        })}
                    </span>
                )
            },
        },
        {
            accessorKey: "tags",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Tags" />
            ),
            cell: ({ row }) => {
                const tags = (row.original.tags ?? []) as string[]
                if (tags.length === 0)
                    return <span className="text-muted-foreground">—</span>
                return (
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {tags.slice(0, 3).map((tag) => (
                            <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs font-normal"
                            >
                                {tag}
                            </Badge>
                        ))}
                        {tags.length > 3 && (
                            <Badge
                                variant="outline"
                                className="text-xs font-normal"
                            >
                                +{tags.length - 3}
                            </Badge>
                        )}
                    </div>
                )
            },
            enableSorting: false,
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const buyer = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted cursor-pointer"
                            >
                                <MoreHorizontal />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuItem
                                asChild
                                className="cursor-pointer"
                            >
                                <Link href={`/dashboard/crm/${buyer.id}`}>
                                    View details
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                asChild
                                className="cursor-pointer"
                            >
                                <Link
                                    href={`/dashboard/chat?buyer=${buyer.id}`}
                                >
                                    Open thread
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
}
