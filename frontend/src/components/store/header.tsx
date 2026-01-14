"use client";

import Link from "next/link";
import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";
import { ShoppingBag, Search, Menu, Package, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/hooks/use-cart";
import { CartSheet } from "./cart-sheet";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-user";
import { UserRole } from "@/types";

export function Header() {
  const { isSignedIn } = useAuth();
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const { data: cart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const cartItemCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="container mx-auto flex h-18 items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-heading text-2xl font-bold tracking-tight text-slate-900 transition-colors">
            LUXE<span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">.</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/products"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-amber-500 after:transition-all after:duration-300"
          >
            All Products
          </Link>
          {isSignedIn && (
            <Link
              href={user?.role === UserRole.ADMIN ? "/admin" : "/orders"}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-amber-500 after:transition-all after:duration-300"
            >
              {user?.role === UserRole.ADMIN ? "Go to Admin" : "My Orders"}
            </Link>
          )}
        </nav>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md mx-8">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-11 h-11 bg-slate-50 border-slate-200 rounded-full focus:bg-white focus:border-amber-300 focus:ring-amber-100 transition-all duration-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Wishlist - Desktop */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex cursor-pointer h-11 w-11 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
          </Button>

          {/* Cart */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative cursor-pointer h-11 w-11 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Open cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-amber-500 text-white border-2 border-white font-semibold"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-lg bg-white p-0">
              <CartSheet />
            </SheetContent>
          </Sheet>

          {/* User Auth */}
          {isSignedIn && !isUserLoading && !!user ? (
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-10 w-10 ring-2 ring-slate-100 hover:ring-amber-200 transition-all",
                },
              }}
            />
          ) : (
            <SignInButton mode="modal">
              <Button className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white rounded-full h-11 px-6 font-medium shadow-sm transition-all duration-300 hover:shadow-md">
                Sign In
              </Button>
            </SignInButton>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="cursor-pointer h-11 w-11 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-white w-80">
              <div className="flex flex-col gap-6 mt-8">
                {/* Mobile Search */}
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="pl-11 h-11 bg-slate-50 border-slate-200 rounded-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </form>

                {/* Mobile Nav Links */}
                <div className="space-y-1">
                  <Link
                    href="/products"
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                      <Package className="h-5 w-5 text-slate-600" />
                    </div>
                    <span className="font-medium">All Products</span>
                  </Link>
                  {isSignedIn && (
                    <>
                      <Link
                        href="/orders"
                        className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                          <ShoppingBag className="h-5 w-5 text-slate-600" />
                        </div>
                        <span className="font-medium">My Orders</span>
                      </Link>
                      <Link
                        href="#"
                        className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                          <Heart className="h-5 w-5 text-slate-600" />
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
