"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Send, ArrowRight, Sprout, Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="bg-secondary/30 text-foreground border-t border-border">
      {/* Newsletter Section */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h3 className="font-heading text-2xl font-bold mb-2 text-foreground">
                Grow with Us
              </h3>
              <p className="text-muted-foreground max-w-md">
                Subscribe for gardening tips, rare plant drops, and exclusive green offers.
              </p>
            </div>
            <div className="flex w-full max-w-md gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="pl-11 h-12 bg-background border-border text-foreground placeholder:text-muted-foreground rounded-full focus:border-primary focus:ring-primary/20 hover:border-primary/50 transition-colors"
                />
              </div>
              <Button className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full cursor-pointer transition-all duration-300 shadow-lg shadow-primary/20">
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
            <Link href="/" className="inline-block mb-6 group">
              <span className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                GreenHaven
                <Sprout className="h-5 w-5 text-primary animate-bounce duration-slow" />
              </span>
            </Link>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Cultivating a greener world, one home at a time. Sustainably sourced plants and seeds for every space.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 cursor-pointer"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 cursor-pointer"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 cursor-pointer"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6 text-foreground">Shop</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/products"
                  className="text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-2 group"
                >
                  <ArrowRight className="h-4 w-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  All Greenery
                </Link>
              </li>
              <li>
                <Link
                  href="/products?sort=createdAt-DESC"
                  className="text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-2 group"
                >
                  <ArrowRight className="h-4 w-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  href="/products?sort=price-ASC"
                  className="text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-2 group"
                >
                  <ArrowRight className="h-4 w-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  Best Sellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6 text-foreground">Account</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/orders"
                  className="text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-2 group"
                >
                  <ArrowRight className="h-4 w-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  My Orders
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-2 group"
                >
                  <ArrowRight className="h-4 w-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  Wishlist
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-2 group"
                >
                  <ArrowRight className="h-4 w-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  Care Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6 text-foreground">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>123 Botanical Blvd<br />Portland, OR 97201</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <a href="tel:1-800-GREEN" className="hover:text-primary transition-colors cursor-pointer">
                  1-800-GREEN
                </a>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <a href="mailto:hello@greenhaven.com" className="hover:text-primary transition-colors cursor-pointer">
                  hello@greenhaven.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border bg-secondary/10">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} GreenHaven. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
