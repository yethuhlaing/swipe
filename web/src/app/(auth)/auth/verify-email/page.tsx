"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LogoImage } from "@/components/shared/logo-image"
import { toast } from "sonner"
import { Mail, CheckCircle2, Clock } from "lucide-react"
import { resendVerificationEmail } from "@/actions/auth"

export default function VerifyEmailPage() {
    const searchParams = useSearchParams()
    const email = searchParams.get("email")
    const [isResending, setIsResending] = useState(false)
    const [canResend, setCanResend] = useState(true)
    const [countdown, setCountdown] = useState(0)

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        } else {
            setCanResend(true)
        }
    }, [countdown])

    const handleResendEmail = async () => {
        if (!email) {
            toast.error("Email address not found")
            return
        }

        setIsResending(true)
        setCanResend(false)

        try {
            const result = await resendVerificationEmail(email)

            if (result.success) {
                toast.success("Verification email sent! Please check your inbox.")
                setCountdown(60) // 1 minute cooldown
            } else {
                toast.error(result.error || "Failed to resend verification email")
                // If there's a retryAfter, set countdown to that value
                if (result.retryAfter) {
                    setCountdown(result.retryAfter)
                } else {
                    setCanResend(true)
                }
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.")
            setCanResend(true)
        } finally {
            setIsResending(false)
        }
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-md">
                <div className="mb-8 flex justify-center">
                    <LogoImage href="/" variant="boxed" logoSize={32} />
                </div>

                <div className="bg-card rounded-lg border p-8 shadow-sm">
                    <div className="mb-6 flex justify-center">
                        <div className="bg-primary/10 text-primary rounded-full p-4">
                            <Mail className="h-8 w-8" />
                        </div>
                    </div>

                    <h1 className="mb-3 text-center text-2xl font-bold">
                        Check your email
                    </h1>

                    <p className="text-muted-foreground mb-6 text-center">
                        We've sent a verification link to
                        {email && (
                            <span className="text-foreground block mt-2 font-medium break-all">
                                {email}
                            </span>
                        )}
                    </p>

                    <div className="bg-muted mb-6 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                            <div className="text-sm">
                                <p className="font-medium mb-1">Next steps:</p>
                                <ol className="text-muted-foreground list-inside list-decimal space-y-1">
                                    <li>Open the email we sent you</li>
                                    <li>Click the verification link</li>
                                    <li>You'll be redirected to your dashboard</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    <div className="bg-muted/50 mb-6 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Clock className="text-muted-foreground mt-0.5 h-5 w-5 flex-shrink-0" />
                            <p className="text-muted-foreground text-sm">
                                The verification link will expire in{" "}
                                <span className="font-medium">24 hours</span>.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={handleResendEmail}
                            disabled={isResending || !canResend}
                            variant="outline"
                            className="w-full"
                        >
                            {isResending
                                ? "Sending..."
                                : countdown > 0
                                    ? `Resend email (${countdown}s)`
                                    : "Resend verification email"}
                        </Button>

                        <p className="text-muted-foreground text-center text-sm">
                            Didn't receive the email? Check your spam folder or{" "}
                            <a
                                href="/auth/signin"
                                className="text-primary hover:underline"
                            >
                                try signing in
                            </a>
                            .
                        </p>
                    </div>
                </div>

                <p className="text-muted-foreground mt-6 text-center text-sm">
                    Need help?{" "}
                    <a href="/support" className="text-primary hover:underline">
                        Contact support
                    </a>
                </p>
            </div>
        </div>
    )
}
