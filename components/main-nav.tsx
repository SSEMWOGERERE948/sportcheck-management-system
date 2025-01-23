"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ShoppingBag, BarChart2, Package, DollarSign, Users, Settings } from "lucide-react";

export function MainNav() {
  const pathname = usePathname();

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: BarChart2,
      active: pathname === "/dashboard",
    },
    {
      href: "/sales",
      label: "Sales",
      icon: ShoppingBag,
      active: pathname === "/sales",
    },
    {
      href: "/inventory",
      label: "Inventory",
      icon: Package,
      active: pathname === "/inventory",
    },
    {
      href: "/expenses",
      label: "Expenses",
      icon: DollarSign,
      active: pathname === "/expenses",
    },
    {
      href: "/customers",
      label: "Customers",
      icon: Users,
      active: pathname === "/customers",
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/settings",
    },
  ];

  return (
    <nav className="flex items-center space-x-6">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
            route.active ? "text-primary" : "text-muted-foreground"
          )}
        >
          <route.icon className="h-4 w-4" />
          <span>{route.label}</span>
        </Link>
      ))}
    </nav>
  );
}