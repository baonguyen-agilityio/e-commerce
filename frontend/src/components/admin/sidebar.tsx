"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Store,
  ChevronRight,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-slate-200 bg-white"
    >
      {/* Header with Logo */}
      <SidebarHeader className="border-b border-slate-100 px-4 py-4">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 shadow-sm">
            <Store className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-heading text-lg font-bold text-slate-900 tracking-tight">
                Luxe<span className="text-amber-500">.</span>
              </span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                Admin
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={cn(
                            "cursor-pointer h-10 rounded-lg transition-all duration-200",
                            isActive
                              ? "bg-amber-50 text-amber-700 font-medium shadow-sm border border-amber-200/50"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          )}
                        >
                          <Link href={item.href} className="flex items-center gap-3">
                            <Icon
                              className={cn(
                                "h-[18px] w-[18px] flex-shrink-0",
                                isActive ? "text-amber-600" : "text-slate-500"
                              )}
                            />
                            <span className="flex-1">{item.title}</span>
                            {isActive && !isCollapsed && (
                              <ChevronRight className="h-4 w-4 text-amber-500" />
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right" className="font-medium">
                          {item.title}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Store Link */}
        <SidebarGroup className="mt-auto pt-4">
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Quick Links
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="cursor-pointer h-10 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
                >
                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-3"
                  >
                    <Store className="h-[18px] w-[18px] text-slate-500" />
                    <span>View Store</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User */}
      <SidebarFooter className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-9 w-9 ring-2 ring-slate-100",
              },
            }}
          />
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-slate-900 truncate">
                Administrator
              </span>
              <span className="text-xs text-slate-500">Manage your store</span>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
