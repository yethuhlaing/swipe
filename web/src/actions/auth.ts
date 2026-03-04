"use server"

import { db } from "@/db"
import { user } from "@/db/schema"
import { eq } from "drizzle-orm"
import { emailVerificationRateLimit } from "@/lib/rate-limit"
import { Resend } from "resend"
import { env } from "@/env"
import { VerificationEmail } from "../emails/verification-email"
import { auth } from "@/lib/auth"


export async function resendVerificationEmail(email: string) {
    try {
        // Validate email input
        if (!email || typeof email !== "string") {
            return {
                success: false,
                error: "Email is required",
            }
        }

        // Apply rate limiting per email (1 request per minute)
        const { success, reset } = await emailVerificationRateLimit.limit(email)

        if (!success) {
            const secondsUntilReset = Math.ceil((reset - Date.now()) / 1000)
            return {
                success: false,
                error: `Rate limit exceeded. Please try again in ${secondsUntilReset} seconds.`,
                retryAfter: secondsUntilReset,
            }
        }

        // Find user by email
        const [existingUser] = await db
            .select()
            .from(user)
            .where(eq(user.email, email))
            .limit(1)

        if (!existingUser) {
            // Don't reveal if email exists or not (security best practice)
            return {
                success: true,
                message:
                    "If the email exists, a verification email has been sent.",
            }
        }

        // Check if already verified
        if (existingUser.emailVerified) {
            return {
                success: false,
                error: "Email is already verified",
            }
        }

        // Use Better Auth's built-in sendVerificationEmail method
        // Better Auth will generate the token and handle the verification URL
        await auth.api.sendVerificationEmail({
            body: {
                email,
                callbackURL: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/verify-success`,
            },
        })

        return {
            success: true,
            message: "Verification email sent successfully",
        }
    } catch (error) {
        console.error("Error in resend-verification:", error)
        return {
            success: false,
            error: "An error occurred while sending the verification email",
        }
    }
}


// Initialize Resend client
const resend = new Resend(env.RESEND_API_KEY)

interface SendVerificationEmailParams {
    to: string
    userName: string
    verificationUrl: string
}

export async function sendVerificationEmail({
    to,
    userName,
    verificationUrl,
}: SendVerificationEmailParams) {
    try {
        const emailHtml = VerificationEmail({
            userName,
            verificationUrl,
        })

        // In development, Resend only allows sending to your verified email
        // In production, verify a domain and use: noreply@yourdomain.com
        const { data, error } = await resend.emails.send({
            from: "onboarding@resend.dev", // Resend's testing domain
            to: env.NODE_ENV === "development" ? "yethusteve217@gmail.com" : to, // Force to your email in dev
            subject: "Verify your email address",
            html: emailHtml,
        })

        if (error) {
            console.error("Failed to send verification email:", error)
            throw new Error(
                `Failed to send verification email: ${error.message}`
            )
        }

        console.log("Verification email sent successfully:", {
            to,
            emailId: data?.id,
        })
        return { success: true, emailId: data?.id }
    } catch (error) {
        console.error("Error in sendVerificationEmail:", error)
        throw error
    }
}
