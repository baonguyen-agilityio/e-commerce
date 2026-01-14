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
        <div className="flex min-h-screen w-full bg-slate-50">
          <AdminSidebar />
          <SidebarInset className="flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm px-6">
              <SidebarTrigger className="cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-slate-100" />
              <Separator orientation="vertical" className="h-6 bg-slate-200" />
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold leading-none text-slate-900">
                  {pageInfo.title}
                </h1>
                {pageInfo.description && (
                  <p className="text-sm text-slate-500">
                    {pageInfo.description}
                  </p>
                )}
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-slate-50">
              <div className="p-6">{children}</div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
