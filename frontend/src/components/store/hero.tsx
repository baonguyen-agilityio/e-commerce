"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Decorative Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-amber-100/60 via-orange-50/40 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-slate-100/80 via-slate-50/40 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        
        {/* Subtle Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #1e293b 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-20 md:py-28 lg:py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Floating Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-amber-800 font-medium text-sm">Trusted by 10,000+ customers</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight text-slate-900 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Discover
            <br />
            <span className="relative">
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                Exceptional
              </span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                <path d="M0 4C50 8 150 0 200 4" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="200" y2="0">
                    <stop stopColor="#f59e0b"/>
                    <stop offset="1" stopColor="#ea580c"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>
            {" "}Quality
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
            Curated selection of premium products crafted with precision and designed for those who appreciate the finer things in life.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            <Link href="/products">
              <Button
                size="lg"
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer group shadow-xl shadow-slate-900/20 h-14 px-8 text-base transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/30 hover:-translate-y-0.5"
              >
                Shop Collection
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/products">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 cursor-pointer h-14 px-8 text-base transition-all duration-300 hover:-translate-y-0.5"
              >
                <Sparkles className="mr-2 h-5 w-5 text-amber-500" />
                New Arrivals
              </Button>
            </Link>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-12 border-t border-slate-200/80 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <div className="flex items-center gap-3 group cursor-default">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Free Shipping</p>
                <p className="text-sm text-slate-500">On orders $100+</p>
              </div>
            </div>
            <div className="flex items-center gap-3 group cursor-default">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Secure Payment</p>
                <p className="text-sm text-slate-500">100% protected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 group cursor-default">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 group-hover:bg-violet-100 transition-colors">
                <svg className="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Easy Returns</p>
                <p className="text-sm text-slate-500">30-day policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3 group cursor-default">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 group-hover:bg-amber-100 transition-colors">
                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900">24/7 Support</p>
                <p className="text-sm text-slate-500">Always here to help</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
