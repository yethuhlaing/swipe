import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export async function proxy(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })
    // THIS IS NOT SECURE!
    // This is the recommended approach to optimistically redirect users
    // We recommend handling auth checks in each page/route
    if (!session) {
        return NextResponse.redirect(new URL("/auth/signin", request.url))
    }

    // Check if email is verified
    if (!session.user.emailVerified) {
        // Block access to protected routes and redirect to verify-email page
        return NextResponse.redirect(
            new URL(
                `/auth/verify-email?email=${encodeURIComponent(session.user.email)}`,
                request.url
            )
        )
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/dashboard-2/:path*",
        "/calendar/:path*",
        "/chat/:path*",
        "/mail/:path*",
        "/tasks/:path*",
        "/users/:path*",
        "/settings/:path*",
        "/pricing/:path*",
        "/faqs/:path*",
    ],
}
