import { notFound } from "next/navigation"
import Link from "next/link"
import { getCurrentTenant } from "@/lib/session"
import { getBuyerById } from "@/data/buyers"
import { listPipelineStages } from "@/data/pipeline"
import { getMessagesByBuyerId } from "@/data/conversations"
import { listOrdersByBuyerId } from "@/data/orders"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { BuyerDetailView } from "../components/buyer-detail-view"
import type { BuyerWithStage } from "@/dto/buyer"
import type { PipelineStage } from "@/db/schema"
import type { Message } from "@/db/schema"
import type { Order } from "@/db/schema"

interface BuyerDetailPageProps {
    params: Promise<{ buyerId: string }>
}

export default async function BuyerDetailPage({ params }: BuyerDetailPageProps) {
    const tenant = await getCurrentTenant()
    if (!tenant) {
        notFound()
    }

    const { buyerId } = await params

    const [buyer, stages, { messages }, ordersList] = await Promise.all([
        getBuyerById(tenant.id, buyerId),
        listPipelineStages(tenant.id),
        getMessagesByBuyerId(tenant.id, buyerId),
        listOrdersByBuyerId(tenant.id, buyerId),
    ])

    if (!buyer) {
        notFound()
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col px-4 lg:px-6">
            <div className="flex flex-col gap-2 mb-4 shrink-0">
                <Button variant="ghost" size="sm" className="w-fit -ml-2" asChild>
                    <Link href="/dashboard/crm">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to buyers
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Buyer profile</h1>
                <p className="text-muted-foreground text-sm">
                    View and edit profile, messages, and orders.
                </p>
            </div>
            <div className="min-h-0 flex-1">
                <BuyerDetailView
                    buyer={buyer as BuyerWithStage}
                    stages={stages as PipelineStage[]}
                    messages={messages}
                    orders={ordersList}
                    tenantId={tenant.id}
                />
            </div>
        </div>
    )
}
