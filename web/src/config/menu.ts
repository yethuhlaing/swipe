import {
    Shield,
    BarChart3,
    Database,
    Building2,
    Rocket,
    Settings,
    Zap,
    Package,
    Layout,
    Crown,
    Palette,
} from "lucide-react"

export const menuSections = [
    {
        title: "Browse Products",
        items: [
            {
                title: "Free Blocks",
                description: "Essential UI components and sections",
                icon: Package,
                href: "#free-blocks",
            },
            {
                title: "Premium Templates",
                description: "Complete page templates and layouts",
                icon: Crown,
                href: "#premium-templates",
            },
            {
                title: "Admin Dashboards",
                description: "Full-featured dashboard solutions",
                icon: BarChart3,
                href: "#admin-dashboards",
            },
            {
                title: "Landing Pages",
                description: "Marketing and product landing templates",
                icon: Layout,
                href: "#landing-pages",
            },
        ],
    },
    {
        title: "Categories",
        items: [
            {
                title: "E-commerce",
                description: "Online store admin panels and components",
                icon: Building2,
                href: "#ecommerce",
            },
            {
                title: "SaaS Dashboards",
                description: "Application admin interfaces",
                icon: Rocket,
                href: "#saas-dashboards",
            },
            {
                title: "Analytics",
                description: "Data visualization and reporting templates",
                icon: BarChart3,
                href: "#analytics",
            },
            {
                title: "Authentication",
                description: "Login, signup, and user management pages",
                icon: Shield,
                href: "#authentication",
            },
        ],
    },
    {
        title: "Resources",
        items: [
            {
                title: "Documentation",
                description: "Integration guides and setup instructions",
                icon: Database,
                href: "#docs",
            },
            {
                title: "Component Showcase",
                description: "Interactive preview of all components",
                icon: Palette,
                href: "#showcase",
            },
            {
                title: "GitHub Repository",
                description: "Open source foundation and community",
                icon: Settings,
                href: "#github",
            },
            {
                title: "Design System",
                description: "shadcn/ui standards and customization",
                icon: Zap,
                href: "#design-system",
            },
        ],
    },
]
