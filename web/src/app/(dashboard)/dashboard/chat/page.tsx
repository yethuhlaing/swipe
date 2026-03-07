import { redirect } from "next/navigation"
import { getCurrentTenant } from "@/lib/session"
import { getConversationByBuyerId } from "@/data/conversations"
import {
    getRecentConversationsAction,
    getPendingDraftsAction,
    getConversationWithMessagesAction,
} from "@/actions/inbox"
import { ChatInbox } from "./components/chat-inbox"
import type { Conversation, Message, User } from "./use-chat"

interface ChatPageProps {
    searchParams: Promise<{ conversation?: string; buyer?: string }>
}

function mapApiConversationToChat(
    conv: Awaited<
        ReturnType<typeof getRecentConversationsAction>
    >["conversations"][number],
    pendingDraftCount: number
): Conversation {
    const b = conv.buyer
    const name =
        b.storeName ||
        (b.instagramUsername ? `@${b.instagramUsername}` : null) ||
        b.instagramName ||
        "Unknown"
    return {
        id: conv.id,
        type: "direct",
        participants: [b.id],
        name,
        avatar: b.instagramProfilePic ?? "",
        lastMessage: {
            id: conv.id,
            content: conv.lastMessagePreview ?? "",
            timestamp:
                conv.lastMessageAt?.toISOString() ?? new Date().toISOString(),
            senderId: conv.buyerId,
        },
        unreadCount: conv.hasUnread ? 1 : 0,
        isPinned: false,
        isMuted: false,
        buyerId: b.id,
        pendingDraftCount:
            pendingDraftCount > 0 ? pendingDraftCount : undefined,
    }
}

function mapApiMessageToChat(
    msg: Awaited<
        ReturnType<typeof getConversationWithMessagesAction>
    >["messages"][number]
): Message {
    return {
        id: msg.id,
        content: msg.content,
        timestamp:
            typeof msg.createdAt === "string"
                ? msg.createdAt
                : (msg.createdAt as Date).toISOString(),
        senderId: msg.direction === "outbound" ? "current-user" : msg.buyerId,
        type: "text",
        isEdited: false,
        reactions: [],
        replyTo: null,
    }
}

function mapBuyersToUsers(
    convs: Awaited<
        ReturnType<typeof getRecentConversationsAction>
    >["conversations"]
): User[] {
    const byId = new Map<string, User>()
    for (const conv of convs) {
        const b = conv.buyer
        if (byId.has(b.id)) continue
        byId.set(b.id, {
            id: b.id,
            name:
                b.storeName ||
                b.instagramUsername ||
                b.instagramName ||
                "Unknown",
            email: "",
            avatar: b.instagramProfilePic ?? "",
            status: "offline",
            lastSeen: "",
            role: "",
            department: "",
        })
    }
    return Array.from(byId.values())
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
    const tenant = await getCurrentTenant()
    if (!tenant) {
        redirect("/dashboard")
    }

    const params = await searchParams
    const conversationIdParam = params.conversation?.trim()
    const buyerIdParam = params.buyer?.trim()

    let conversationId: string | null = conversationIdParam || null
    if (!conversationId && buyerIdParam) {
        const conv = await getConversationByBuyerId(tenant.id, buyerIdParam)
        conversationId = conv?.id ?? null
    }

    const [conversationsResult, draftsResult, threadResult] = await Promise.all(
        [
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
        ]
    )

    let apiConversations = conversationsResult.success
        ? conversationsResult.conversations
        : []
    // When deep-linking to a conversation, ensure it's in the list
    if (
        threadResult.success &&
        threadResult.conversation &&
        !apiConversations.some((c) => c.id === threadResult.conversation!.id)
    ) {
        apiConversations = [threadResult.conversation, ...apiConversations]
    }
    const drafts = draftsResult.success ? draftsResult.drafts : []
    const draftCountByConversationId = drafts.reduce<Record<string, number>>(
        (acc, d) => {
            acc[d.conversationId] = (acc[d.conversationId] ?? 0) + 1
            return acc
        },
        {}
    )

    const conversations: Conversation[] = apiConversations.map((c) =>
        mapApiConversationToChat(c, draftCountByConversationId[c.id] ?? 0)
    )
    const users: User[] = mapBuyersToUsers(apiConversations)

    let messages: Record<string, Message[]> = {}
    let pendingDraft:
        | Awaited<ReturnType<typeof getPendingDraftsAction>>["drafts"][number]
        | null = null

    if (
        threadResult.success &&
        threadResult.conversation &&
        threadResult.messages
    ) {
        const cid = threadResult.conversation.id
        messages[cid] = threadResult.messages.map(mapApiMessageToChat)
        pendingDraft = drafts.find((d) => d.conversationId === cid) ?? null
    }

    return (
        <ChatInbox
            tenantId={tenant.id}
            conversations={conversations}
            messages={messages}
            users={users}
            selectedConversationId={conversationId}
            pendingDraft={pendingDraft}
        />
    )
}
