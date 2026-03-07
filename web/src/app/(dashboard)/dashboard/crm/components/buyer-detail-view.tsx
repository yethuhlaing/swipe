"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, FileText, ShoppingBag, User } from "lucide-react"
import type { BuyerWithStage } from "@/lib/dto"
import type { PipelineStage } from "@/db/schema"
import type { Message } from "@/db/schema"
import type { Order } from "@/db/schema"
import { BuyerDetail } from "./buyer-detail"
import { BuyerTags } from "./buyer-tags"
import { BuyerMessagesTab } from "./buyer-messages-tab"
import { BuyerOrdersTab } from "./buyer-orders-tab"

interface BuyerDetailViewProps {
    buyer: BuyerWithStage
    stages: PipelineStage[]
    messages: Message[]
    orders: Order[]
    tenantId: string
}

export function BuyerDetailView({
    buyer,
    stages,
    messages,
    orders,
    tenantId,
}: BuyerDetailViewProps) {
    return (
        <Tabs defaultValue="overview" className="flex flex-col min-h-0 flex-1">
            <TabsList className="w-full justify-start flex-wrap h-auto gap-1 p-1 bg-muted/50">
                <TabsTrigger value="overview" className="gap-1.5">
                    <User className="h-4 w-4" />
                    Overview
                </TabsTrigger>
                <TabsTrigger value="messages" className="gap-1.5">
                    <MessageSquare className="h-4 w-4" />
                    Messages
                    {messages.length > 0 && (
                        <span className="text-muted-foreground tabular-nums">
                            ({messages.length})
                        </span>
                    )}
                </TabsTrigger>
                <TabsTrigger value="orders" className="gap-1.5">
                    <ShoppingBag className="h-4 w-4" />
                    Orders
                    {orders.length > 0 && (
                        <span className="text-muted-foreground tabular-nums">
                            ({orders.length})
                        </span>
                    )}
                </TabsTrigger>
                <TabsTrigger value="notes" className="gap-1.5">
                    <FileText className="h-4 w-4" />
                    Notes
                </TabsTrigger>
            </TabsList>
            <div className="flex-1 min-h-0 pt-4 overflow-auto">
                <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
                    <BuyerDetail
                        buyer={buyer}
                        stages={stages}
                        tenantId={tenantId}
                    />
                    <div className="mt-6">
                        <BuyerTags
                            buyerId={buyer.id}
                            tenantId={tenantId}
                            tags={(buyer.tags ?? []) as string[]}
                        />
                    </div>
                </TabsContent>
                <TabsContent value="messages" className="mt-0 focus-visible:outline-none">
                    <BuyerMessagesTab messages={messages} buyer={buyer} />
                </TabsContent>
                <TabsContent value="orders" className="mt-0 focus-visible:outline-none">
                    <BuyerOrdersTab orders={orders} />
                </TabsContent>
                <TabsContent value="notes" className="mt-0 focus-visible:outline-none">
                    <BuyerDetail
                        buyer={buyer}
                        stages={stages}
                        tenantId={tenantId}
                        notesOnly
                    />
                </TabsContent>
            </div>
        </Tabs>
    )
}
