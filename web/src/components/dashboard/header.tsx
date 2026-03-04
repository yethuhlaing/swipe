"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
    CommandSearch,
    SearchTrigger,
} from "@/components/shared/command-search"
import { ModeToggle } from "@/components/shared/mode-toggle"
import { UpgradeToProButton } from "@/components/button/upgrade-to-pro-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CircleUser, CreditCard, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { signOut } from "@/lib/auth-client"

interface DashboardHeaderProps {
    user: {
        name: string | null
        email: string
        image: string | null
    } | null
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
    const router = useRouter()
    const [searchOpen, setSearchOpen] = React.useState(false)

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setSearchOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const handleLogout = async () => {
        await signOut()
        router.push("/")
    }

    const userInitial =
        user?.name?.[0]?.toUpperCase() || user?.email[0].toUpperCase()

    return (
        <>
            <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
                <div className="flex w-full items-center gap-1 px-4 py-3 lg:gap-2 lg:px-6">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mx-2 data-[orientation=vertical]:h-4"
                    />
                    <div className="flex-1 max-w-sm">
                        <SearchTrigger onClick={() => setSearchOpen(true)} />
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <UpgradeToProButton />
                        <ModeToggle />
                        {user && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="relative h-8 w-8 rounded-full"
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage
                                                src={user.image || undefined}
                                                alt={user.name || user.email}
                                            />
                                            <AvatarFallback>
                                                {userInitial}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-56"
                                    align="end"
                                    forceMount
                                >
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {user.name || "User"}
                                            </p>
                                            <p className="text-muted-foreground text-xs leading-none">
                                                {user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem
                                            asChild
                                            className="cursor-pointer"
                                        >
                                            <Link href="/settings/user">
                                                <CircleUser className="mr-2 h-4 w-4" />
                                                <span>Account</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            asChild
                                            className="cursor-pointer"
                                        >
                                            <Link href="/settings/billing">
                                                <CreditCard className="mr-2 h-4 w-4" />
                                                <span>Billing</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            asChild
                                            className="cursor-pointer"
                                        >
                                            <Link href="/settings/user">
                                                <Settings className="mr-2 h-4 w-4" />
                                                <span>Settings</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="cursor-pointer"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </header>
            <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
        </>
    )
}
