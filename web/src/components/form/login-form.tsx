"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/utils/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "@/lib/auth-client"
import { toast } from "sonner"

export function LoginForm2({
    className,
    ...props
}: React.ComponentProps<"form">) {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showResendVerification, setShowResendVerification] = useState(false)
    const [isResending, setIsResending] = useState(false)

    const handleEmailPasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await signIn.email({
                email,
                password,
                callbackURL: "/dashboard",
            })

            if (result.error) {
                console.error("Login error:", result.error)
                console.log(
                    "Error structure:",
                    JSON.stringify(result.error, null, 2)
                )

                const errorCode = result.error.code
                const errorMessage = result.error.message || ""

                console.log("Extracted errorCode:", errorCode)
                console.log("Extracted errorMessage:", errorMessage)
                console.log("About to call toast.error")

                // Error code to message mapping
                const errorMessages: Record<string, string> = {
                    EMAIL_NOT_VERIFIED:
                        "Please verify your email before logging in. Check your inbox!",
                    INVALID_EMAIL_OR_PASSWORD: "Invalid email or password",
                    INVALID_PASSWORD: "Invalid email or password",
                    INVALID_EMAIL: "Invalid email or password",
                    USER_NOT_FOUND: "Invalid email or password",
                    CREDENTIAL_ACCOUNT_NOT_FOUND: "Invalid email or password",
                    SESSION_EXPIRED:
                        "Your session has expired. Please try again.",
                }

                // Check for email verification error
                if (errorCode === "EMAIL_NOT_VERIFIED") {
                    const message =
                        errorMessages[errorCode] ||
                        "Please verify your email before logging in."
                    console.log("Showing verification toast:", message)
                    toast.error(message)
                    setShowResendVerification(true)
                } else {
                    // Show direct message based on error code or fallback to error message
                    const message =
                        errorCode && errorMessages[errorCode]
                            ? errorMessages[errorCode]
                            : errorMessage || "Login failed. Please try again."
                    console.log("Showing error toast:", message)
                    toast.error(message)
                    setShowResendVerification(false)
                }

                setIsLoading(false)
                return
            }

            toast.success("Login successful!")
            router.push("/dashboard")
        } catch (error: any) {
            console.error("Login exception:", error)

            if (error?.status === 403) {
                toast.error(
                    "Session error. Please refresh the page and try again."
                )
            } else {
                toast.error(error?.message || "An unexpected error occurred")
            }
            setIsLoading(false)
        }
    }

    const handleResendVerification = async () => {
        if (!email) {
            toast.error("Please enter your email address")
            return
        }

        setIsResending(true)
        try {
            const response = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (response.ok) {
                toast.success("Verification email sent! Check your inbox.")
                setShowResendVerification(false)
            } else {
                toast.error(data.error || "Failed to send verification email")
            }
        } catch (error) {
            toast.error("Failed to send verification email")
        } finally {
            setIsResending(false)
        }
    }

    const handleGoogleLogin = async () => {
        setIsLoading(true)
        try {
            await signIn.social({
                provider: "google",
                callbackURL: "/dashboard",
            })
        } catch (error) {
            toast.error("Failed to login with Google")
            setIsLoading(false)
        }
    }

    return (
        <form
            className={cn("flex flex-col gap-6", className)}
            {...props}
            onSubmit={handleEmailPasswordLogin}
        >
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Login to your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Enter your email below to login to your account
                </p>
            </div>
            <div className="grid gap-6">
                <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="test@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div className="grid gap-3">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <a
                            href="/forgot-password"
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                            Forgot your password?
                        </a>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                <Button
                    type="submit"
                    className="w-full cursor-pointer"
                    disabled={isLoading}
                >
                    {isLoading ? "Loading..." : "Login"}
                </Button>
                {showResendVerification && (
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full cursor-pointer"
                        onClick={handleResendVerification}
                        disabled={isResending}
                    >
                        {isResending
                            ? "Sending..."
                            : "Resend Verification Email"}
                    </Button>
                )}
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                    <span className="bg-background text-muted-foreground relative z-10 px-2">
                        Or continue with
                    </span>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full cursor-pointer"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="mr-2 h-4 w-4"
                    >
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Login with Google
                </Button>
            </div>
            <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/auth/signup" className="underline underline-offset-4">
                    Sign up
                </a>
            </div>
        </form>
    )
}
