"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ShoppingBag,
  BarChart2,
  Package,
  DollarSign,
  Settings,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function MainNav({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  const routes = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart2, active: pathname === "/dashboard" },
    { href: "/sales", label: "Sales", icon: ShoppingBag, active: pathname === "/sales" },
    { href: "/inventory", label: "Inventory", icon: Package, active: pathname === "/inventory" },
    { href: "/expenses", label: "Expenses", icon: DollarSign, active: pathname === "/expenses" },
    { href: "/settings", label: "Settings", icon: Settings, active: pathname === "/settings" },
  ];

  return (
    <nav className="w-64 h-full bg-white border-r relative">
      {/* Close Button for Small Screens */}
      {onClose && (
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 md:hidden"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </button>
      )}

      {/* Theme Toggle Section */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <ThemeToggle />
        </div>
      </header>

      {/* Navigation Links */}
      <ul className="space-y-4 p-4">
        {routes.map((route) => (
          <li key={route.href}>
            <Link
              href={route.href}
              className={cn(
                "flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-primary",
                route.active ? "text-primary" : ""
              )}
            >
              <route.icon className="h-5 w-5" />
              <span>{route.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
