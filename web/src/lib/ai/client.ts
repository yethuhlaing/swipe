import { createOpenAI } from "@ai-sdk/openai"

/**
 * OpenAI Provider via Vercel AI SDK
 *
 * Uses OPENAI_API_KEY from environment.
 * When deployed to Vercel with AI features enabled, this key is automatically provided.
 */
export const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Default model for SWIPE AI features
 */
export const DEFAULT_MODEL = "gpt-4o" as const

/**
 * Get the default model instance
 */
export function getModel() {
    return openai(DEFAULT_MODEL)
}

/**
 * Token usage tracking
 */
export type TokenUsage = {
    promptTokens: number
    completionTokens: number
    totalTokens: number
}
