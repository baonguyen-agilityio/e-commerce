import Link from "next/link";
import { Mail, Phone, MapPin, Send, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h3 className="font-heading text-2xl font-bold mb-2">
                Stay in the Loop
              </h3>
              <p className="text-slate-400 max-w-md">
                Subscribe to get special offers, free giveaways, and exclusive deals.
              </p>
            </div>
            <div className="flex w-full max-w-md gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="pl-11 h-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 rounded-full focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>
              <Button className="h-12 px-6 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-full cursor-pointer transition-all duration-300">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <span className="font-heading text-2xl font-bold tracking-tight">
                LUXE<span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">.</span>
              </span>
            </Link>
            <p className="text-slate-400 leading-relaxed mb-6">
              Curated collection of premium products for those who appreciate exceptional quality.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-amber-500 hover:text-white transition-all duration-300 cursor-pointer"
                aria-label="Facebook"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-amber-500 hover:text-white transition-all duration-300 cursor-pointer"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-amber-500 hover:text-white transition-all duration-300 cursor-pointer"
                aria-label="Twitter"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6">Shop</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/products"
                  className="text-slate-400 hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-2 group"
                >
                  <ArrowRight className="h-4 w-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/products?sort=createdAt-DESC"
                  className="text-slate-400 hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-2 group"
                >
                  <ArrowRight className="h-4 w-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  href="/products?sort=price-ASC"
                  className="text-slate-400 hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-2 group"
                >
                  <ArrowRight className="h-4 w-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  Best Sellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6">Account</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/orders"
                  className="text-slate-400 hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-2 group"
                >
                  <ArrowRight className="h-4 w-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  My Orders
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-400 hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-2 group"
                >
                  <ArrowRight className="h-4 w-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  Wishlist
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-400 hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-2 group"
                >
                  <ArrowRight className="h-4 w-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-slate-400">
                <MapPin className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>123 Luxury Lane<br />New York, NY 10001</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <Phone className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <a href="tel:1-800-LUXE" className="hover:text-amber-400 transition-colors cursor-pointer">
                  1-800-LUXE
                </a>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <Mail className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <a href="mailto:support@luxe.store" className="hover:text-amber-400 transition-colors cursor-pointer">
                  support@luxe.store
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} LUXE. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
