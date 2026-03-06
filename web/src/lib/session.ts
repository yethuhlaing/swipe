import { cache } from "react"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getTenantByOwnerId } from "@/lib/data/tenants"

export const getSession = cache(async () => {
    return await auth.api.getSession({
        headers: await headers(),
    })
})

export const getCurrentUser = cache(async () => {
    const session = await getSession()
    const currentUser = session?.user

    if (!currentUser) return null

    return {
        id: currentUser.id,
        name: currentUser.name ?? null,
        email: currentUser.email,
        image: currentUser.image ?? null,
    }
})

export const getCurrentTenant = cache(async () => {
    const session = await getSession()
    const userId = session?.user?.id
    if (!userId) return null
    return getTenantByOwnerId(userId)
})
