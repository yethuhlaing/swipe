"use client"

import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag } from "lucide-react"
import type { Order } from "@/db/schema"

interface BuyerOrdersTabProps {
    orders: Order[]
}

function formatCurrency(value: string | null, currency = "USD") {
    if (value == null) return "—"
    const num = Number(value)
    if (Number.isNaN(num)) return "—"
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
    }).format(num)
}

export function BuyerOrdersTab({ orders }: BuyerOrdersTabProps) {
    if (orders.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground text-sm">
                        No orders for this buyer yet.
                    </p>
                </CardContent>
            </Card>
        )
    }

    const totalRevenue = orders.reduce(
        (sum, o) => sum + Number(o.total ?? 0),
        0
    )

    return (
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle>Order history</CardTitle>
                <p className="text-sm text-muted-foreground">
                    {orders.length} order{orders.length !== 1 ? "s" : ""} ·{" "}
                    {formatCurrency(String(totalRevenue))} total
                </p>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Items</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">
                                        {order.shopifyOrderNumber ?? `#${order.id.slice(0, 8)}`}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {format(new Date(order.createdAt), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                order.status === "fulfilled" ||
                                                order.status === "paid"
                                                    ? "default"
                                                    : "secondary"
                                            }
                                            className="capitalize"
                                        >
                                            {order.status}
                                        </Badge>
                                        {order.isReorder && (
                                            <Badge
                                                variant="outline"
                                                className="ml-1 text-xs"
                                            >
                                                Reorder
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right font-medium tabular-nums">
                                        {formatCurrency(order.total?.toString(), order.currency ?? undefined)}
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground tabular-nums">
                                        {order.itemCount ?? "—"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
