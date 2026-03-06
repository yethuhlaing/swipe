import { generateText, Output } from "ai"
import { z } from "zod"
import { getModel, type TokenUsage } from "./client"

/**
 * Intent Classification
 *
 * Classifies the intent of a buyer's message to determine:
 * - What type of inquiry it is
 * - What pipeline stage the buyer should move to
 * - Confidence level of the classification
 */

export const MessageIntentSchema = z.enum([
    "wholesale_inquiry",
    "product_question",
    "order_request",
    "reorder_confirm",
    "general",
    "unknown",
])

export type MessageIntent = z.infer<typeof MessageIntentSchema>

export const IntentClassificationSchema = z.object({
    intent: MessageIntentSchema,
    confidence: z.number().min(0).max(1).describe("Confidence level between 0 and 1"),
    suggestedStage: z
        .enum([
            "cold-outreach",
            "interested",
            "needs-recommendation",
            "catalog-sent",
            "draft-order-sent",
            "paid",
            "reorder",
        ])
        .optional()
        .describe("Suggested pipeline stage for the buyer"),
    reasoning: z.string().optional().describe("Brief explanation for the classification"),
})

export type IntentClassification = z.infer<typeof IntentClassificationSchema>

type ClassifyIntentInput = {
    messageContent: string
    conversationContext?: {
        previousMessages?: Array<{ role: "buyer" | "brand"; content: string }>
        currentStage?: string
    }
}

const INTENT_CLASSIFICATION_PROMPT = `You are an AI assistant for a wholesale sales platform. Your job is to classify the intent of buyer messages in Instagram DMs.

Classify the message into one of these intents:
- "wholesale_inquiry": Buyer is asking about wholesale partnership, MOQs, pricing, becoming a retailer
- "product_question": Buyer is asking about specific products, availability, features
- "order_request": Buyer wants to place an order or is confirming products they want
- "reorder_confirm": Buyer is confirming they want to reorder (response to reorder outreach)
- "general": General conversation, greetings, thank you, not directly wholesale-related
- "unknown": Cannot determine intent

Also suggest which pipeline stage the buyer should be in:
- "cold-outreach": Initial contact, no engagement yet
- "interested": Buyer has shown interest in wholesale
- "needs-recommendation": Buyer needs product guidance
- "catalog-sent": Catalog has been shared, awaiting response
- "draft-order-sent": Draft order/invoice sent, awaiting payment
- "paid": Order has been paid
- "reorder": In reorder cycle`

export async function classifyIntent(input: ClassifyIntentInput): Promise<IntentClassification> {
    const contextMessages = input.conversationContext?.previousMessages
        ?.slice(-5)
        .map((m) => `${m.role === "buyer" ? "Buyer" : "Brand"}: ${m.content}`)
        .join("\n")

    const userPrompt = `
${contextMessages ? `Recent conversation:\n${contextMessages}\n\n` : ""}
Current stage: ${input.conversationContext?.currentStage ?? "unknown"}

New message from buyer:
"${input.messageContent}"

Classify this message.`

    try {
        const { output } = await generateText({
            model: getModel(),
            output: Output.object({
                schema: IntentClassificationSchema,
            }),
            system: INTENT_CLASSIFICATION_PROMPT,
            prompt: userPrompt,
            temperature: 0.3,
            maxOutputTokens: 200,
        })

        if (!output) {
            return defaultClassification()
        }

        return output
    } catch (error) {
        console.error("Intent classification failed:", error)
        return defaultClassification()
    }
}

function defaultClassification(): IntentClassification {
    return {
        intent: "unknown",
        confidence: 0,
        reasoning: "Classification failed",
    }
}

/**
 * Draft Reply Generation
 *
 * Generates a contextual draft reply for the brand to approve/edit/send.
 */

type GenerateDraftInput = {
    intent: MessageIntent
    messageContent: string
    buyerContext: {
        name?: string
        storeName?: string
        storeType?: string
    }
    conversationHistory: Array<{ role: "buyer" | "brand"; content: string }>
}

type DraftReplyResult = {
    content: string
    usage?: TokenUsage
}

const DRAFT_GENERATION_PROMPT = `You are a friendly wholesale sales representative helping indie fashion and CPG brands communicate with retail buyers via Instagram DM.

Your tone should be:
- Professional but warm and conversational
- Helpful and knowledgeable about wholesale
- Enthusiastic about the brand's products
- Concise (DMs should be digestible, not essays)

Generate a draft reply that:
1. Addresses the buyer's question or intent
2. Moves the conversation toward the next logical step
3. Feels authentic to Instagram DM style (not too formal)
4. Uses the buyer's name if available

Do NOT include:
- Emojis unless appropriate for the context
- Generic filler phrases
- Long paragraphs (keep it conversational)

Respond with ONLY the message text, nothing else.`

export async function generateDraftReply(input: GenerateDraftInput): Promise<DraftReplyResult> {
    const contextMessages = input.conversationHistory
        .slice(-6)
        .map((m) => `${m.role === "buyer" ? "Buyer" : "Brand"}: ${m.content}`)
        .join("\n")

    const buyerInfo = [
        input.buyerContext.name && `Name: ${input.buyerContext.name}`,
        input.buyerContext.storeName && `Store: ${input.buyerContext.storeName}`,
        input.buyerContext.storeType && `Store type: ${input.buyerContext.storeType}`,
    ]
        .filter(Boolean)
        .join("\n")

    const userPrompt = `
Buyer info:
${buyerInfo || "Unknown buyer"}

Detected intent: ${input.intent}

Conversation history:
${contextMessages || "No previous messages"}

Latest buyer message:
"${input.messageContent}"

Generate a draft reply:`

    try {
        const { text, usage } = await generateText({
            model: getModel(),
            system: DRAFT_GENERATION_PROMPT,
            prompt: userPrompt,
            temperature: 0.7,
            maxOutputTokens: 300,
        })

        return {
            content: text.trim() || getDefaultReply(input.intent),
            usage: usage
                ? {
                      promptTokens: usage.inputTokens ?? 0,
                      completionTokens: usage.outputTokens ?? 0,
                      totalTokens: (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0),
                  }
                : undefined,
        }
    } catch (error) {
        console.error("Draft generation failed:", error)
        return {
            content: getDefaultReply(input.intent),
        }
    }
}

function getDefaultReply(intent: MessageIntent): string {
    const defaults: Record<MessageIntent, string> = {
        wholesale_inquiry:
            "Thanks for reaching out about wholesale! I'd love to share more about our partnership opportunities. Would you like me to send over our catalog?",
        product_question:
            "Great question! Let me get you that information. Can you tell me a bit more about what you're looking for?",
        order_request:
            "Perfect! I'd be happy to put together an order for you. Let me know which products you're interested in and I'll create a draft order.",
        reorder_confirm:
            "Awesome! I'll put together your reorder now. Would you like the same items as last time, or would you like to make any changes?",
        general: "Thanks for your message! How can I help you today?",
        unknown: "Thanks for reaching out! How can I help you with your wholesale needs?",
    }

    return defaults[intent]
}
