import {
  Banknote,
  Briefcase,
  Calendar,
  ClipboardList,
  FileText,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  type LucideIcon,
  ReceiptText,
  UserCheck,
  Users,
} from "lucide-react";

export type NavBadge = "new" | "soon";

export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

interface NavItemBase {
  id: string;
  title: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

export interface NavMainLinkItem extends NavItemBase {
  url: string;
  subItems?: never;
}

export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}

export type NavMainItem = NavMainLinkItem | NavMainParentItem;

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Main",
    items: [
      {
        id: "overview",
        title: "Overview",
        url: "/dashboard/overview",
        icon: LayoutDashboard,
      },
      {
        id: "enquiries",
        title: "Enquiries",
        url: "/dashboard/enquiries",
        icon: Inbox,
      },
      {
        id: "quotes",
        title: "Quotations",
        url: "/dashboard/quotes",
        icon: FileText,
      },
      {
        id: "jobs",
        title: "Jobs",
        icon: Briefcase,
        subItems: [
          { id: "all-jobs", title: "All Jobs", url: "/dashboard/jobs", icon: ClipboardList },
          { id: "jobs-calendar", title: "Calendar", url: "/dashboard/jobs/calendar", icon: Calendar },
        ],
      },
      {
        id: "invoices",
        title: "Invoices",
        url: "/dashboard/invoices",
        icon: ReceiptText,
      },
    ],
  },
  {
    id: 2,
    label: "Management",
    items: [
      {
        id: "cleaners",
        title: "Cleaners",
        url: "/dashboard/cleaners",
        icon: UserCheck,
      },
      {
        id: "customers",
        title: "Customers",
        url: "/dashboard/customers",
        icon: Users,
      },
      {
        id: "payments",
        title: "Payments",
        url: "/dashboard/payments",
        icon: Banknote,
      },
      {
        id: "gallery",
        title: "Gallery Manager",
        url: "/dashboard/gallery",
        icon: ImageIcon,
      },
    ],
  },
];
