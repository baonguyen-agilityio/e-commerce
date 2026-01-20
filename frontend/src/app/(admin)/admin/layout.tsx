"use client";

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, { title: string; description: string }> = {
  "/admin": { title: "Dashboard", description: "Overview of your store performance" },
  "/admin/products": { title: "Products", description: "Manage your product catalog" },
  "/admin/categories": { title: "Categories", description: "Organize your products" },
  "/admin/orders": { title: "Orders", description: "Track and manage orders" },
  "/admin/users": { title: "Users", description: "Manage user accounts" },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pageInfo = pageTitles[pathname] || { title: "Admin", description: "" };

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background/50">
          <AdminSidebar />
          <SidebarInset className="flex flex-col bg-background/50">
            {/* Header */}
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 md:px-8">
              <SidebarTrigger className="cursor-pointer text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors" />
              <Separator orientation="vertical" className="h-6 bg-border" />
              <div className="flex flex-col">
                <h1 className="text-xl font-heading font-bold leading-none text-foreground tracking-tight">
                  {pageInfo.title}
                </h1>
                {pageInfo.description && (
                  <p className="text-sm font-medium text-muted-foreground mt-0.5">
                    {pageInfo.description}
                  </p>
                )}
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
              <div className="p-6">{children}</div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
