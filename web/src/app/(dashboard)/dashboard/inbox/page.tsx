import { redirect } from "next/navigation"
import { getCurrentTenant } from "@/lib/session"
import { getConversationByBuyerId } from "@/lib/data/conversations"
import {
    getRecentConversationsAction,
    getPendingDraftsAction,
    getConversationWithMessagesAction,
} from "@/actions/inbox"
import { InboxLayout } from "./components/inbox-layout"

interface InboxPageProps {
    searchParams: Promise<{ conversation?: string; buyer?: string }>
}

export default async function InboxPage({ searchParams }: InboxPageProps) {
    const tenant = await getCurrentTenant()
    if (!tenant) {
        redirect("/dashboard")
    }

    const params = await searchParams
    const conversationIdParam = params.conversation?.trim()
    const buyerIdParam = params.buyer?.trim()

    // Resolve conversationId: from ?conversation= or ?buyer= (lookup conversation by buyer)
    let conversationId: string | null = conversationIdParam || null
    if (!conversationId && buyerIdParam) {
        const conv = await getConversationByBuyerId(tenant.id, buyerIdParam)
        conversationId = conv?.id ?? null
    }

    const [conversationsResult, draftsResult, threadResult] = await Promise.all([
        getRecentConversationsAction(tenant.id),
        getPendingDraftsAction(tenant.id),
        conversationId
            ? getConversationWithMessagesAction(tenant.id, conversationId)
            : Promise.resolve({
                  success: true as const,
                  conversation: null,
                  messages: [] as Awaited<
                      ReturnType<typeof getConversationWithMessagesAction>
                  >["messages"],
              }),
    ])

    const conversations =
        conversationsResult.success ? conversationsResult.conversations : []
    const drafts = draftsResult.success ? draftsResult.drafts : []
    const selectedConversation =
        threadResult.success && threadResult.conversation
            ? threadResult.conversation
            : null
    const messages =
        threadResult.success && threadResult.messages ? threadResult.messages : []

    // Pending draft for the selected conversation (if any)
    const pendingDraftForThread = selectedConversation
        ? drafts.find(
              (d) => d.conversationId === selectedConversation.id
          )
        : null

    return (
        <div className="flex min-h-0 flex-1 flex-col px-4 lg:px-6">
            <div className="flex flex-col gap-2 mb-4 shrink-0">
                <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
                <p className="text-muted-foreground">
                    Review AI-drafted replies and manage DM conversations.
                </p>
            </div>
            <div className="min-h-0 flex-1">
                <InboxLayout
                    tenantId={tenant.id}
                    conversations={conversations}
                    drafts={drafts}
                    selectedConversation={selectedConversation}
                    messages={messages}
                    pendingDraft={pendingDraftForThread ?? null}
                />
            </div>
        </div>
    )
}
