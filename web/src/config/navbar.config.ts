import {
    LayoutPanelLeft,
    LayoutDashboard,
    BarChart3,
    Mail,
    CheckSquare,
    MessageCircle,
    Calendar,
    Settings,
    HelpCircle,
    CreditCard,
    Users,
    Kanban,
} from "lucide-react"

export const navbarConfig = {
    user: {
        name: "ShadcnStore",
        email: "store@example.com",
        avatar: "",
    },
    navGroups: [
        {
            label: "Dashboards",
            items: [
                {
                    title: "Pipeline",
                    url: "/dashboard/pipeline",
                    icon: Kanban,
                },
                {
                    title: "Buyers",
                    url: "/dashboard/crm",
                    icon: Users,
                },
                {
                    title: "Analytics",
                    url: "/dashboard/analytics",
                    icon: BarChart3,
                },
                {
                    title: "Dashboard 1",
                    url: "/dashboard",
                    icon: LayoutDashboard,
                },
                {
                    title: "Dashboard 2",
                    url: "/dashboard-2",
                    icon: LayoutPanelLeft,
                },
            ],
        },
        {
            label: "Apps",
            items: [
                {
                    title: "Mail",
                    url: "/mail",
                    icon: Mail,
                },
                {
                    title: "Tasks",
                    url: "/tasks",
                    icon: CheckSquare,
                },
                {
                    title: "Chat",
                    url: "/dashboard/chat",
                    icon: MessageCircle,
                },
                {
                    title: "Calendar",
                    url: "/calendar",
                    icon: Calendar,
                },
                {
                    title: "Users",
                    url: "/users",
                    icon: Users,
                },
            ],
        },
        {
            label: "Pages",
            items: [
                {
                    title: "Settings",
                    url: "#",
                    icon: Settings,
                    items: [
                        {
                            title: "User Settings",
                            url: "/settings/user",
                        },
                        {
                            title: "Account Settings",
                            url: "/settings/account",
                        },
                        {
                            title: "Integrations",
                            url: "/settings/integrations",
                        },
                        {
                            title: "Pipeline Config",
                            url: "/settings/pipeline",
                        },
                        {
                            title: "Plans & Billing",
                            url: "/settings/billing",
                        },
                        {
                            title: "Notifications",
                            url: "/settings/notifications",
                        },
                        {
                            title: "Connections (Legacy)",
                            url: "/settings/connections",
                        },
                    ],
                },
                {
                    title: "FAQs",
                    url: "/faqs",
                    icon: HelpCircle,
                },
                {
                    title: "Pricing",
                    url: "/pricing",
                    icon: CreditCard,
                },
            ],
        },
    ],
}
