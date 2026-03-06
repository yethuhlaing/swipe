"use client"

import Link from "next/link"
import { MessageCircle, User, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface QuickActionsProps {
    buyerId: string
    onOpenThread?: () => void
    className?: string
}

export function QuickActions({
    buyerId,
    onOpenThread,
    className,
}: QuickActionsProps) {
    return (
        <div className={className}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="sr-only">Actions</span>
                        <MoreHorizontal className="size-4 text-muted-foreground" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link
                            href={`/dashboard/crm/${buyerId}`}
                            className="flex items-center gap-2"
                        >
                            <User className="size-4" />
                            View details
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link
                            href={`/dashboard/inbox?buyer=${buyerId}`}
                            className="flex items-center gap-2"
                            onClick={onOpenThread}
                        >
                            <MessageCircle className="size-4" />
                            Open thread
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
