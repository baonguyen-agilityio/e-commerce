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
import { UserButtonWrapper } from "@/components/admin/user-button-wrapper";
import {
  LayoutDashboard,
  Sprout,
  Layers,
  ShoppingCart,
  Users,
  Store,
  ChevronRight,
  Leaf,
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
    icon: Sprout,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: Layers,
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
      className="border-r border-border/50 bg-card"
    >
      {/* Header with Logo */}
      <SidebarHeader className="border-b border-border/50 px-4 py-4">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-heading text-xl font-bold text-foreground tracking-tight flex items-center gap-1">
                GreenHaven
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Admin Console
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-3 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-3">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5">
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
                            "cursor-pointer h-11 rounded-xl transition-all duration-300 font-medium",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 hover:text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                          )}
                        >
                          <Link href={item.href} className="flex items-center gap-3">
                            <Icon
                              className={cn(
                                "h-5 w-5 flex-shrink-0 transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                              )}
                            />
                            <span className="flex-1">{item.title}</span>
                            {isActive && !isCollapsed && (
                              <ChevronRight className="h-4 w-4 text-primary/70" />
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right" className="font-bold bg-primary text-primary-foreground border-primary rounded-lg">
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
          <SidebarGroupLabel className="px-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-3">
            Quick Links
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="cursor-pointer h-11 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-300 border border-transparent hover:border-border"
                >
                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-3"
                  >
                    <div className="flex items-center justify-center w-5 h-5">
                      <Store className="h-4 w-4" />
                    </div>
                    <span>View Storefront</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User */}
      <SidebarFooter className="border-t border-border/50 p-4 bg-secondary/10">
        <div className="flex items-center gap-4 bg-background p-3 rounded-2xl border border-border shadow-sm">
          <UserButtonWrapper
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-9 w-9 ring-2 ring-background rounded-full",
              },
            }}
          />
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-foreground truncate">
                Admin User
              </span>
              <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                <Sprout className="h-3 w-3 text-primary" />
                Store Manager
              </span>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
