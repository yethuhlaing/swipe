/**
 * Example Drizzle ORM Queries
 *
 * This file demonstrates common database operations using Drizzle ORM.
 * Copy and adapt these patterns for your application.
 */

import { db } from "@/db"
import { user, session, account } from "@/db/schema"
import { eq, and, or, like, desc, asc, count } from "drizzle-orm"

// ========================================
// SELECT QUERIES
// ========================================

/**
 * Get all users
 */
export async function getAllUsers() {
    return await db.select().from(user)
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
    const result = await db.select().from(user).where(eq(user.id, userId))
    return result[0] // Returns first result or undefined
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
    const result = await db
        .select()
        .from(user)
        .where(eq(user.email, email))
    return result[0]
}

/**
 * Search users by name (case-insensitive)
 */
export async function searchUsersByName(searchTerm: string) {
    return await db
        .select()
        .from(user)
        .where(like(user.name, `%${searchTerm}%`))
}

/**
 * Get verified users only
 */
export async function getVerifiedUsers() {
    return await db.select().from(user).where(eq(user.emailVerified, true))
}

/**
 * Get users with pagination
 */
export async function getUsersPaginated(page: number = 1, pageSize: number = 10) {
    const offset = (page - 1) * pageSize

    return await db
        .select()
        .from(user)
        .limit(pageSize)
        .offset(offset)
        .orderBy(desc(user.createdAt))
}

/**
 * Count total users
 */
export async function countUsers() {
    const result = await db.select({ count: count() }).from(user)
    return result[0].count
}

// ========================================
// INSERT QUERIES
// ========================================

/**
 * Create a new user
 */
export async function createUser(data: {
    id: string
    email: string
    name?: string
    image?: string
}) {
    const result = await db
        .insert(user)
        .values(data)
        .returning() // Returns the inserted row

    return result[0]
}

/**
 * Bulk insert users
 */
export async function createManyUsers(
    users: Array<{ id: string; email: string; name?: string }>
) {
    return await db.insert(user).values(users).returning()
}

// ========================================
// UPDATE QUERIES
// ========================================

/**
 * Update user name
 */
export async function updateUserName(userId: string, name: string) {
    const result = await db
        .update(user)
        .set({ name, updatedAt: new Date() })
        .where(eq(user.id, userId))
        .returning()

    return result[0]
}

/**
 * Verify user email
 */
export async function verifyUserEmail(userId: string) {
    const result = await db
        .update(user)
        .set({ emailVerified: true, updatedAt: new Date() })
        .where(eq(user.id, userId))
        .returning()

    return result[0]
}

/**
 * Update user profile
 */
export async function updateUserProfile(
    userId: string,
    data: { name?: string; image?: string }
) {
    const result = await db
        .update(user)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(user.id, userId))
        .returning()

    return result[0]
}

// ========================================
// DELETE QUERIES
// ========================================

/**
 * Delete user by ID
 */
export async function deleteUser(userId: string) {
    await db.delete(user).where(eq(user.id, userId))
}

/**
 * Delete unverified users older than X days
 */
export async function deleteUnverifiedUsers(daysOld: number = 7) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    await db
        .delete(user)
        .where(
            and(
                eq(user.emailVerified, false),
                // Add date comparison here if needed
            )
        )
}

// ========================================
// JOIN QUERIES
// ========================================

/**
 * Get user with their sessions
 */
export async function getUserWithSessions(userId: string) {
    return await db
        .select()
        .from(user)
        .leftJoin(session, eq(user.id, session.userId))
        .where(eq(user.id, userId))
}

/**
 * Get user with OAuth accounts
 */
export async function getUserWithAccounts(userId: string) {
    return await db
        .select()
        .from(user)
        .leftJoin(account, eq(user.id, account.userId))
        .where(eq(user.id, userId))
}

// ========================================
// COMPLEX QUERIES
// ========================================

/**
 * Get users with multiple conditions
 */
export async function getActiveVerifiedUsers() {
    return await db
        .select()
        .from(user)
        .where(
            and(
                eq(user.emailVerified, true),
                // Add more conditions as needed
            )
        )
        .orderBy(desc(user.createdAt))
}

/**
 * Search users by email OR name
 */
export async function searchUsers(query: string) {
    return await db
        .select()
        .from(user)
        .where(
            or(like(user.email, `%${query}%`), like(user.name, `%${query}%`))
        )
}

// ========================================
// TRANSACTION EXAMPLE
// ========================================

/**
 * Create user with initial session (transaction)
 */
export async function createUserWithSession(userData: {
    id: string
    email: string
    name?: string
}) {
    return await db.transaction(async (tx) => {
        // Insert user
        const newUser = await tx
            .insert(user)
            .values(userData)
            .returning()
            .then((rows) => rows[0])

        // Insert session
        const newSession = await tx
            .insert(session)
            .values({
                id: `session_${Date.now()}`,
                userId: newUser.id,
                token: `token_${Date.now()}`,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            })
            .returning()
            .then((rows) => rows[0])

        return { user: newUser, session: newSession }
    })
}

// ========================================
// AGGREGATE QUERIES
// ========================================

/**
 * Get user statistics
 */
export async function getUserStats() {
    const totalUsers = await db.select({ count: count() }).from(user)

    const verifiedUsers = await db
        .select({ count: count() })
        .from(user)
        .where(eq(user.emailVerified, true))

    return {
        total: totalUsers[0].count,
        verified: verifiedUsers[0].count,
        unverified: totalUsers[0].count - verifiedUsers[0].count,
    }
}
