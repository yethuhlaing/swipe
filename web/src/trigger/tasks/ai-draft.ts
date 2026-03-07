import { task } from "@trigger.dev/sdk/v3"
import { db } from "@/db"
import { aiDrafts, messages, buyers, pipelineStages } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"
import type { AiDraftPayload, ClassifyIntentPayload } from "../client"
import { triggerTask } from "../client"
import {
    classifyIntent,
    generateDraftReply,
    type IntentClassification,
} from "@/services/intent.service"

/**
 * AI Draft Task
 *
 * Generates AI-drafted reply for incoming messages:
 * 1. Fetch conversation context (previous messages)
 * 2. Classify intent of the message
 * 3. Generate draft reply
 * 4. Store draft for human approval
 * 5. Update buyer stage if suggested
 */
export const aiDraft = task({
    id: "ai.draft",
    retry: {
        maxAttempts: 3,
        minTimeoutInMs: 2000,
        maxTimeoutInMs: 30000,
    },
    run: async (payload: AiDraftPayload) => {
        const {
            tenantId,
            conversationId,
            buyerId,
            triggerMessageId,
            messageContent,
            buyerContext,
        } = payload

        // 1. Fetch recent conversation history for context
        const recentMessages = await db
            .select({
                direction: messages.direction,
                content: messages.content,
            })
            .from(messages)
            .where(eq(messages.conversationId, conversationId))
            .orderBy(desc(messages.createdAt))
            .limit(10)

        const conversationHistory = recentMessages.reverse().map((m) => ({
            role:
                m.direction === "inbound"
                    ? ("buyer" as const)
                    : ("brand" as const),
            content: m.content,
        }))

        // 2. Classify intent
        const intentResult = await classifyIntent({
            messageContent,
            conversationContext: {
                previousMessages: conversationHistory,
                currentStage: buyerContext.currentStage,
            },
        })

        // 3. Update message with intent classification
        await db
            .update(messages)
            .set({
                intent: intentResult.intent,
                intentConfidence: String(intentResult.confidence),
                updatedAt: new Date(),
            })
            .where(eq(messages.id, triggerMessageId))

        // 4. Get suggested stage if intent suggests a stage change
        let suggestedStageId: string | undefined
        if (intentResult.suggestedStage) {
            const [stage] = await db
                .select()
                .from(pipelineStages)
                .where(
                    and(
                        eq(pipelineStages.tenantId, tenantId),
                        eq(pipelineStages.slug, intentResult.suggestedStage)
                    )
                )
                .limit(1)

            suggestedStageId = stage?.id
        }

        // 5. Generate draft reply
        const draftContent = await generateDraftReply({
            intent: intentResult.intent,
            messageContent,
            buyerContext: {
                name: buyerContext.name,
                storeName: buyerContext.storeName,
                storeType: buyerContext.storeType,
            },
            conversationHistory,
        })

        // 6. Store draft for human approval
        const [draft] = await db
            .insert(aiDrafts)
            .values({
                tenantId,
                conversationId,
                buyerId,
                content: draftContent.content,
                suggestedStageId,
                model: "gpt-4o",
                promptTokens: String(draftContent.usage?.promptTokens ?? 0),
                completionTokens: String(
                    draftContent.usage?.completionTokens ?? 0
                ),
                confidence: String(intentResult.confidence),
                status: "pending",
                triggerMessageId,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            })
            .returning()

        // 7. Track analytics
        await triggerTask("analytics.track", {
            tenantId,
            eventType: "ai_draft.created",
            eventName: "AI Draft Created",
            buyerId,
            conversationId,
            data: {
                intent: intentResult.intent,
                confidence: intentResult.confidence,
                suggestedStage: intentResult.suggestedStage,
            },
        })

        return {
            success: true,
            draftId: draft.id,
            intent: intentResult.intent,
            confidence: intentResult.confidence,
            suggestedStageId,
        }
    },
})

/**
 * Classify Intent Task
 *
 * Standalone intent classification (can be called directly)
 */
export const classifyIntentTask = task({
    id: "ai.classify-intent",
    retry: {
        maxAttempts: 3,
        minTimeoutInMs: 1000,
        maxTimeoutInMs: 10000,
    },
    run: async (
        payload: ClassifyIntentPayload
    ): Promise<IntentClassification> => {
        const result = await classifyIntent({
            messageContent: payload.messageContent,
            conversationContext: payload.conversationContext,
        })

        return result
    },
})
