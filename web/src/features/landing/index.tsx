"use client"

import React from "react"
import { LandingNavbar } from "../../features/landing/navbar"
import { HeroSection } from "../../features/landing/hero-section"
import { LogoCarousel } from "../../features/landing/logo-carousel"
import { StatsSection } from "../../features/landing/stats-section"
import { FeaturesSection } from "../../features/landing/features-section"
import { TeamSection } from "../../features/landing/team-section"
import { TestimonialsSection } from "../../features/landing/testimonials-section"
import { BlogSection } from "../../features/landing/blog-section"
import { PricingSection } from "../../features/landing/pricing-section"
import { CTASection } from "../../features/landing/cta-section"
import { ContactSection } from "../../features/landing/contact-section"
import { FaqSection } from "../../features/landing/faq-section"
import { LandingFooter } from "../../features/landing/footer"
import { AboutSection } from "../../features/landing/about-section"

export function LandingPageContent() {
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
