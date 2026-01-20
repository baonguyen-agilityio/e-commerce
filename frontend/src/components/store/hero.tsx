"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sprout, Star, Leaf } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background min-h-[90vh] flex items-center">
      {/* Decorative Background - Aurora UI Style */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-gradient-to-br from-primary/20 via-secondary/30 to-transparent rounded-full blur-[120px] animate-pulse duration-[8s]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-tr from-accent/10 via-background to-transparent rounded-full blur-[100px] animate-pulse duration-[10s]" />
        <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-gradient-to-r from-secondary/50 to-transparent rounded-full blur-[80px]" />

        {/* Subtle Mesh Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Floating Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-primary/20 shadow-xl shadow-primary/5 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent animate-in zoom-in duration-500 delay-[200ms]" style={{ animationDelay: `${i * 100}ms` }} />
              ))}
            </div>
            <span className="text-foreground font-bold text-sm tracking-tight">PREMIUM ORGANIC SEEDS & PLANTS</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tighter text-foreground mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Cultivate Your
            <br />
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-600 to-primary/80">
              Own Sanctuary
              <svg className="absolute -bottom-4 left-0 w-full opacity-60" viewBox="0 0 200 8" fill="none">
                <path d="M0 4C50 8 150 0 200 4" stroke="url(#hero-gradient)" strokeWidth="4" strokeLinecap="round" />
                <defs>
                  <linearGradient id="hero-gradient" x1="0" y1="0" x2="200" y2="0">
                    <stop stopColor="#2E8B57" />
                    <stop offset="1" stopColor="#E8ECD6" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-400 font-medium">
            Bring nature indoors with our curated collection of rare house plants and heirlooom seeds. Sustainably sourced for your green paradise.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <Link href="/products">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold cursor-pointer group shadow-2xl shadow-primary/20 h-16 px-10 text-lg rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95"
              >
                Shop Collection
                <ArrowRight className="ml-3 h-6 w-6 transition-transform duration-500 group-hover:translate-x-2" />
              </Button>
            </Link>
            <Link href="/products">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/80 backdrop-blur-sm border-2 border-primary/20 text-foreground hover:bg-secondary hover:border-primary/40 cursor-pointer h-16 px-10 text-lg rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 font-bold"
              >
                <Leaf className="mr-3 h-6 w-6 text-primary scale-110" />
                New Arrivals
              </Button>
            </Link>
          </div>
        </div>

        {/* Trust Indicators - Enhanced */}
        <div className="mt-24 pt-16 border-t border-border/60 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="flex flex-col items-center md:items-start md:flex-row gap-4 group cursor-default">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-lg shadow-primary/5 group-hover:scale-110">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-center md:text-left">
                <p className="font-bold text-foreground text-lg">Safe Arrival</p>
                <p className="text-sm text-muted-foreground font-medium">Guaranteed healthy</p>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-start md:flex-row gap-4 group cursor-default">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-lg shadow-primary/5 group-hover:scale-110">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="text-center md:text-left">
                <p className="font-bold text-foreground text-lg">Secure Checkout</p>
                <p className="text-sm text-muted-foreground font-medium">Encrypted & safe</p>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-start md:flex-row gap-4 group cursor-default">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-lg shadow-primary/5 group-hover:scale-110">
                <Sprout className="h-7 w-7" />
              </div>
              <div className="text-center md:text-left">
                <p className="font-bold text-foreground text-lg">Expert Care</p>
                <p className="text-sm text-muted-foreground font-medium">Guides included</p>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-start md:flex-row gap-4 group cursor-default">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-lg shadow-primary/5 group-hover:scale-110">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="text-center md:text-left">
                <p className="font-bold text-foreground text-lg">24/7 Support</p>
                <p className="text-sm text-muted-foreground font-medium">Plant experts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
