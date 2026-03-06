import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Create your workspace",
    description: "Set up your wholesale workspace",
}

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
            {children}
        </div>
    )
}
