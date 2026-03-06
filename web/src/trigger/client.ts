import { tasks, TriggerOptions } from "@trigger.dev/sdk/v3"
import type { TaskPayloads } from "./types"

export type {
    TaskPayloads,
    InboxProcessPayload,
    AiDraftPayload,
    ClassifyIntentPayload,
    ShopifySyncPayload,
    ShopifyWebhookPayload,
    ReorderCheckPayload,
    ReorderSendPayload,
    AnalyticsTrackPayload,
} from "./types"

export async function triggerTask<T extends keyof TaskPayloads>(
    taskId: T,
    payload: TaskPayloads[T],
    options?: {
        idempotencyKey?: string
        delay?: string | Date
        queue?: { name: string }
    }
) {
    return tasks.trigger(taskId, payload, options as TriggerOptions | undefined)
}

export async function triggerTaskBatch<T extends keyof TaskPayloads>(
    taskId: T,
    payloads: TaskPayloads[T][],
    options?: {
        idempotencyKeyPrefix?: string
    }
) {
    return tasks.batchTrigger(
        taskId,
        payloads.map((payload, index) => ({
            payload,
            options: options?.idempotencyKeyPrefix
                ? { idempotencyKey: `${options.idempotencyKeyPrefix}-${index}` }
                : undefined,
        }))
    )
}
