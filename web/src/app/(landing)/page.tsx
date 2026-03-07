import { HeroSection } from "@/app/(landing)/components/hero-section"
import type { Metadata } from "next"
import { LandingNavbar } from "@/app/(landing)/components/navbar"
import { LogoCarousel } from "@/app/(landing)/components/logo-carousel"
import { StatsSection } from "@/app/(landing)/components/stats-section"
import { FeaturesSection } from "@/app/(landing)/components/features-section"
import { TeamSection } from "@/app/(landing)/components/team-section"
import { TestimonialsSection } from "@/app/(landing)/components/testimonials-section"
import { BlogSection } from "@/app/(landing)/components/blog-section"
import { PricingSection } from "@/app/(landing)/components/pricing-section"
import { CTASection } from "@/app/(landing)/components/cta-section"
import { ContactSection } from "@/app/(landing)/components/contact-section"
import { FaqSection } from "@/app/(landing)/components/faq-section"
import { LandingFooter } from "@/app/(landing)/components/footer"
import { AboutSection } from "@/app/(landing)/components/about-section"

// Metadata for the landing page
export const metadata: Metadata = {
    title: "ShadcnStore - Modern Admin Dashboard Template",
    description:
        "A beautiful and comprehensive admin dashboard template built with React, Next.js, TypeScript, and shadcn/ui. Perfect for building modern web applications.",
    keywords: [
        "admin dashboard",
        "react",
        "nextjs",
        "typescript",
        "shadcn/ui",
        "tailwind css",
    ],
    openGraph: {
        title: "ShadcnStore - Modern Admin Dashboard Template",
        description:
            "A beautiful and comprehensive admin dashboard template built with React, Next.js, TypeScript, and shadcn/ui.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "ShadcnStore - Modern Admin Dashboard Template",
        description:
            "A beautiful and comprehensive admin dashboard template built with React, Next.js, TypeScript, and shadcn/ui.",
    },
}

export default function HomePage() {
    return (
        <>
            {/* Navigation */}
            <LandingNavbar />

            {/* Main Content */}
            <main>
                <HeroSection />
                <LogoCarousel />
                <StatsSection />
                <AboutSection />
                <FeaturesSection />
                <TeamSection />
                <PricingSection />
                <TestimonialsSection />
                <BlogSection />
                <FaqSection />
                <CTASection />
                <ContactSection />
            </main>

            {/* Footer */}
            <LandingFooter />
        </>
    )
}
