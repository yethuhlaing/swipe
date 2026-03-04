import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/db"
import * as schema from "@/db/schema"
import { nextCookies } from "better-auth/next-js"
import { sendVerificationEmail } from "@/actions/auth"

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    trustedOrigins: [
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    ],
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        // sendResetPassword: async ({ user, url, token }, request) => {
        //     void sendEmail({
        //         to: user.email,
        //         subject: "Reset your password",
        //         text: `Click the link to reset your password: ${url}`,
        //     })
        // },
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }, request) => {
            // Better Auth provides the complete verification URL
            // Don't await to prevent timing attacks
            void sendVerificationEmail({
                to: user.email,
                userName: user.name || user.email,
                verificationUrl: url, // Use Better Auth's pre-built URL
            })
        },
        verificationTokenExpiration: 60 * 60 * 24, // 24 hours in seconds
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
    plugins: [nextCookies()],
})
