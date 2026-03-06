import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogoImage } from "@/components/shared/logo-image"
import { AlertCircle, Mail } from "lucide-react"

function getErrorMessage(error: string) {
    switch (error) {
        case "expired":
            return {
                title: "Verification Link Expired",
                description:
                    "The verification link has expired. Verification links are valid for 24 hours.",
                action: "Request a new verification email to continue.",
            }
        case "invalid":
            return {
                title: "Invalid Verification Link",
                description:
                    "The verification link is invalid or has already been used.",
                action: "Please request a new verification email or contact support if the problem persists.",
            }
        case "already-verified":
            return {
                title: "Email Already Verified",
                description: "Your email address has already been verified.",
                action: "You can sign in to your account.",
            }
        default:
            return {
                title: "Verification Failed",
                description:
                    "We couldn't verify your email address due to an unexpected error.",
                action: "Please try again or contact support if the problem persists.",
            }
    }
}

export default async function VerifyErrorPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const { error = "unknown" } = await searchParams
    const errorInfo = getErrorMessage(error)

    return (
        <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-md">
                <div className="mb-8 flex justify-center">
                    <LogoImage href="/" variant="boxed" logoSize={32} />
                </div>

                <div className="bg-card rounded-lg border p-8 shadow-sm">
                    <div className="mb-6 flex justify-center">
                        <div className="bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-full p-4">
                            <AlertCircle className="h-8 w-8" />
                        </div>
                    </div>

                    <h1 className="mb-3 text-center text-2xl font-bold">
                        {errorInfo.title}
                    </h1>

                    <p className="text-muted-foreground mb-2 text-center">
                        {errorInfo.description}
                    </p>

                    <p className="text-muted-foreground mb-6 text-center text-sm">
                        {errorInfo.action}
                    </p>

                    <div className="space-y-3">
                        {error !== "already-verified" ? (
                            <>
                                <Button asChild className="w-full">
                                    <Link href="/auth/verify-email">
                                        <Mail className="mr-2 h-4 w-4" />
                                        Request New Verification Email
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/auth/signin">
                                        Go to Sign In
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <Button asChild className="w-full">
                                <Link href="/auth/signin">
                                    Go to Sign In
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <p className="text-muted-foreground mt-6 text-center text-sm">
                    Need help?{" "}
                    <Link href="/support" className="text-primary hover:underline">
                        Contact support
                    </Link>
                </p>
            </div>
        </div>
    )
}
