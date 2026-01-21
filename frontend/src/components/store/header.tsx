"use client";

import Link from "next/link";
import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";
import {
  ShoppingBag,
  Search,
  Menu,
  Leaf,
  Heart,
  Shield,
  Sprout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/hooks/use-cart";
import { CartSheet } from "./cart-sheet";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-user";

const ROLE_LEVELS: Record<string, number> = {
  customer: 0,
  staff: 1,
  admin: 2,
  super_admin: 3,
};

function isStaffOrHigher(role: string | undefined): boolean {
  return (ROLE_LEVELS[role || "customer"] ?? 0) >= ROLE_LEVELS.staff;
}

export function Header() {
  const { isSignedIn } = useAuth();
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const { data: cart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();

  const cartItemCount =
    cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const canAccessAdmin = isStaffOrHigher(user?.role);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border transition-all duration-300">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group relative">
          <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors duration-300">
            <Leaf className="h-6 w-6 text-primary transition-transform duration-300 group-hover:rotate-12" />
          </div>
          <span className="font-heading text-2xl font-bold tracking-tight text-foreground transition-all duration-300 group-hover:tracking-wider">
            GreenHaven
            <span className="text-primary">
              .
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10">
          <Link
            href="/products"
            className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer relative py-2 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-primary after:transition-all after:duration-500"
          >
            Collections
          </Link>
          {isSignedIn && (
            <>
              <Link
                href={"/orders"}
                className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer relative py-2 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-primary after:transition-all after:duration-500"
              >
                Orders
              </Link>
              {canAccessAdmin && (
                <Link
                  href="/admin"
                  className="text-sm font-bold bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl active:scale-95"
                >
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Search Bar - Desktop */}
        <form
          onSubmit={handleSearch}
          className="hidden lg:flex flex-1 max-w-sm mx-12"
        >
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
            <Input
              type="search"
              placeholder="Search plants, seeds..."
              className="pl-11 h-11 bg-secondary/30 border-secondary-foreground/10 rounded-full focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-500 placeholder:text-muted-foreground/70"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Wishlist - Desktop */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex cursor-pointer h-11 w-11 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-300 group"
            aria-label="Wishlist"
          >
            <Heart className="h-5.5 w-5.5 transition-transform duration-300 group-hover:scale-110" />
          </Button>

          {/* Cart */}
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative cursor-pointer h-11 w-11 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-300 group"
                aria-label="Open cart"
              >
                <ShoppingBag className="h-5.5 w-5.5 transition-transform duration-300 group-hover:scale-110" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground border-2 border-background font-bold animate-in zoom-in duration-300">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:max-w-lg bg-white p-0 border-l border-border"
            >
              <CartSheet onClose={() => setIsCartOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* User Auth */}
          {isSignedIn && !isUserLoading && !!user ? (
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox:
                    "h-10 w-10 ring-2 ring-background hover:ring-primary/50 transition-all",
                },
              }}
            />
          ) : (
            <SignInButton mode="modal">
              <Button className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-11 px-6 font-medium shadow-sm transition-all duration-300 hover:shadow-md">
                Sign In
              </Button>
            </SignInButton>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer h-11 w-11 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-background w-80">
              <div className="flex flex-col gap-6 mt-8">
                {/* Mobile Search */}
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="pl-11 h-11 bg-secondary/50 border-input rounded-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </form>

                {/* Mobile Nav Links */}
                <div className="space-y-1">
                  <Link
                    href="/products"
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-foreground hover:bg-secondary transition-colors cursor-pointer"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <Sprout className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">All Products</span>
                  </Link>
                  {isSignedIn && (
                    <>
                      <Link
                        href="/orders"
                        className="flex items-center gap-4 px-4 py-3 rounded-xl text-foreground hover:bg-secondary transition-colors cursor-pointer"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                          <ShoppingBag className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium">My Orders</span>
                      </Link>
                      {canAccessAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-4 px-4 py-3 rounded-xl text-foreground hover:bg-secondary transition-colors cursor-pointer"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                            <Shield className="h-5 w-5 text-amber-600" />
                          </div>
                          <span className="font-medium">Admin Panel</span>
                        </Link>
                      )}
                      <Link
                        href="#"
                        className="flex items-center gap-4 px-4 py-3 rounded-xl text-foreground hover:bg-secondary transition-colors cursor-pointer"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                          <Heart className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium">Wishlist</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
