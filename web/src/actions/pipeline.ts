"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { getTenantById } from "@/data/tenants"
import { updatePipelineStage } from "@/data/pipeline"

const updatePipelineStageSchema = z.object({
    name: z.string().min(1, "Stage name is required").max(120),
    color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color"),
    aiConfidenceThreshold: z.coerce
        .number()
        .min(0, "AI threshold must be at least 0")
        .max(100, "AI threshold cannot exceed 100"),
})

async function verifyTenantAccess(tenantId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })
    if (!session?.user) {
        return { authorized: false as const, error: "Unauthorized" }
    }

    const tenant = await getTenantById(tenantId)
    if (!tenant || tenant.ownerId !== session.user.id) {
        return { authorized: false as const, error: "Not found" }
    }

    return { authorized: true as const }
}

export async function updatePipelineStageAction(
    tenantId: string,
    stageId: string,
    formData: FormData
) {
    const access = await verifyTenantAccess(tenantId)
    if (!access.authorized) {
        return { success: false, error: access.error }
    }

    const validation = updatePipelineStageSchema.safeParse({
        name: formData.get("name"),
        color: formData.get("color"),
        aiConfidenceThreshold: formData.get("aiConfidenceThreshold"),
    })

    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message }
    }

    try {
        const updated = await updatePipelineStage(
            tenantId,
            stageId,
            validation.data
        )
        if (!updated) {
            return { success: false, error: "Stage not found" }
        }

        revalidatePath("/settings/pipeline")
        revalidatePath("/dashboard/pipeline")
        return { success: true }
    } catch (error) {
        console.error("Failed to update pipeline stage:", error)
        return { success: false, error: "Failed to update stage" }
    }
}
