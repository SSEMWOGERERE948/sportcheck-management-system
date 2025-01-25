"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { MainNav } from "@/components/main-nav";
import { useState } from "react";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  
  const pathname = usePathname(); // Get the current path
  const isLoginPage = pathname === "/"; // Adjust this condition if your login page is at another path

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex h-screen">
            {/* Conditionally render the Sidebar */}
            {!isLoginPage && (
              <>
                <aside
                  className={`fixed z-40 top-0 left-0 h-full bg-white border-r transition-transform ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                  } md:translate-x-0 w-64`}
                >
                  <MainNav onClose={toggleSidebar} />
                </aside>

                {/* Overlay for small screens */}
                {isSidebarOpen && (
                  <div
                    className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
                    onClick={toggleSidebar}
                  ></div>
                )}
              </>
            )}

            {/* Main Content */}
            <div
              className={`flex-1 flex flex-col ${
                !isLoginPage ? "md:ml-64" : ""
              }`}
            >
              {/* Topbar with Sidebar Toggle for small screens */}
              {!isLoginPage && (
                <header className="p-4 bg-white shadow md:hidden">
                  <button
                    onClick={toggleSidebar}
                    className="flex items-center space-x-2 text-gray-600"
                  >
                    <Menu className="h-6 w-6" />
                    <span>Menu</span>
                  </button>
                </header>
              )}

              {/* Main Content */}
              <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
