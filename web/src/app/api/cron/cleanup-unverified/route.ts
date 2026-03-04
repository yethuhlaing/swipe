import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { user } from "@/db/schema"
import { and, eq, lt } from "drizzle-orm"

export async function GET(request: NextRequest) {
    try {
        // Verify the request is from a trusted source (Vercel Cron)
        const authHeader = request.headers.get("authorization")
        const cronSecret = process.env.CRON_SECRET

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Calculate date 7 days ago
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        // Find unverified accounts older than 7 days
        const unverifiedAccounts = await db
            .select({
                id: user.id,
                email: user.email,
                createdAt: user.createdAt,
            })
            .from(user)
            .where(
                and(
                    eq(user.emailVerified, false),
                    lt(user.createdAt, sevenDaysAgo)
                )
            )

        if (unverifiedAccounts.length === 0) {
            console.log("No unverified accounts to clean up")
            return NextResponse.json({
                message: "No unverified accounts to clean up",
                deleted: 0,
            })
        }

        // Delete unverified accounts
        // Note: Related records in sessions and accounts tables will be cascade deleted
        const accountIds = unverifiedAccounts.map((account) => account.id)

        for (const accountId of accountIds) {
            await db.delete(user).where(eq(user.id, accountId))
        }

        console.log(
            `Cleanup completed: Deleted ${unverifiedAccounts.length} unverified accounts`,
            unverifiedAccounts.map((a) => ({ email: a.email, createdAt: a.createdAt }))
        )

        return NextResponse.json({
            message: "Cleanup completed successfully",
            deleted: unverifiedAccounts.length,
            accounts: unverifiedAccounts.map((a) => ({
                email: a.email,
                createdAt: a.createdAt,
            })),
        })
    } catch (error) {
        console.error("Error in cleanup-unverified cron job:", error)
        return NextResponse.json(
            { error: "An error occurred during cleanup" },
            { status: 500 }
        )
    }
}
