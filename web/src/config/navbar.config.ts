import {
    LayoutPanelLeft,
    LayoutDashboard,
    Mail,
    CheckSquare,
    MessageCircle,
    Calendar,
    Settings,
    HelpCircle,
    CreditCard,
    Users,
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
                    url: "/chat",
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
                            title: "Plans & Billing",
                            url: "/settings/billing",
                        },
                        {
                            title: "Notifications",
                            url: "/settings/notifications",
                        },
                        {
                            title: "Connections",
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
