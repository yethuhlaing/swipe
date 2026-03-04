"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogoImage } from "@/components/shared/logo-image"
import { CheckCircle, ArrowRight } from "lucide-react"

export default function VerifySuccessPage() {
    const router = useRouter()
    const [countdown, setCountdown] = useState(3)

    useEffect(() => {
        if (countdown === 0) {
            router.push("/dashboard")
            return
        }

        const timer = setTimeout(() => {
            setCountdown(countdown - 1)
        }, 1000)

        return () => clearTimeout(timer)
    }, [countdown, router])

    return (
        <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-md">
                <div className="mb-8 flex justify-center">
                    <LogoImage href="/" variant="boxed" logoSize={32} />
                </div>

                <div className="bg-card rounded-lg border p-8 shadow-sm text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400 rounded-full p-4">
                            <CheckCircle className="h-12 w-12" />
                        </div>
                    </div>

                    <h1 className="mb-3 text-2xl font-bold">
                        Email Verified Successfully!
                    </h1>

                    <p className="text-muted-foreground mb-6">
                        Your email has been verified. You can now access all features of
                        your account.
                    </p>

                    <div className="bg-muted mb-6 rounded-lg p-4">
                        <p className="text-sm">
                            Redirecting to dashboard in{" "}
                            <span className="font-bold text-lg">{countdown}</span>{" "}
                            {countdown === 1 ? "second" : "seconds"}...
                        </p>
                    </div>

                    <Button
                        onClick={() => router.push("/dashboard")}
                        className="w-full"
                    >
                        Go to Dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
