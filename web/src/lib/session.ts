import { cache } from "react"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

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
        name: currentUser.name ?? null,
        email: currentUser.email,
        image: currentUser.image ?? null,
    }
})
