import { db } from "@/db"
import { pipelineStages, type PipelineStage } from "@/db/schema"
import { eq, and, asc } from "drizzle-orm"

/**
 * Pipeline Data Access Layer
 *
 * Stage listing for pipeline views.
 */

export async function listPipelineStages(
    tenantId: string
): Promise<PipelineStage[]> {
    return db
        .select()
        .from(pipelineStages)
        .where(
            and(
                eq(pipelineStages.tenantId, tenantId),
                eq(pipelineStages.isActive, true)
            )
        )
        .orderBy(asc(pipelineStages.position))
}
