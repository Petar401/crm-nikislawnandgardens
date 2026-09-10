import {
  LayoutDashboard,
  Sprout,
  Users,
  Briefcase,
  CheckSquare,
  NotebookPen,
  FolderOpen,
  Receipt,
  Package,
  Mail,
  Settings,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";

import type { PermissionKey } from "@/lib/constants/permissions";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: PermissionKey;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/clients",
    label: "Clients",
    icon: Sprout,
    permission: "companies.view",
  },
  {
    href: "/contacts",
    label: "Contacts",
    icon: Users,
    permission: "contacts.view",
  },
  { href: "/deals", label: "Deals", icon: Briefcase, permission: "deals.view" },
  {
    href: "/leads",
    label: "Leads",
    icon: Target,
    permission: "leads.view",
  },
  {
    href: "/email",
    label: "Email",
    icon: Mail,
    permission: "email.view",
  },
  {
    href: "/tasks",
    label: "Tasks",
    icon: CheckSquare,
    permission: "tasks.view",
  },
  {
    href: "/notes",
    label: "Notes",
    icon: NotebookPen,
    permission: "notebook.view",
  },
  {
    href: "/files",
    label: "Files",
    icon: FolderOpen,
    permission: "files.view",
  },
  {
    href: "/invoices",
    label: "Receipts",
    icon: Receipt,
    permission: "invoices.view",
  },
  {
    href: "/products",
    label: "Products",
    icon: Package,
    permission: "products.view",
  },
  {
    href: "/aria",
    label: "Aria",
    icon: Sparkles,
    permission: "ai.use",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    permission: "settings.view",
  },
];
