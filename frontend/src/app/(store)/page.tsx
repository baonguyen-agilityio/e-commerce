"use client";

import { Hero } from "@/components/store/hero";
import { ProductCard } from "@/components/store/product-card";
import { useProducts } from "@/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Package, Shield, RefreshCw, Truck, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { data: productsData, isLoading } = useProducts({ limit: 8 });

  return (
    <div className="bg-slate-50">
      <Hero />

      {/* Featured Products Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <Badge className="bg-amber-100 text-amber-700 border-0 mb-3">
              <Sparkles className="h-3 w-3 mr-1" />
              Curated for You
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Featured Products
            </h2>
            <p className="text-slate-500 mt-2 text-lg">
              Discover our handpicked selection of premium items
            </p>
          </div>
          <Link href="/products">
            <Button 
              variant="outline" 
              className="cursor-pointer group border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300 h-11 px-6"
            >
              View All Products
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/5] rounded-2xl bg-slate-200" />
                <Skeleton className="h-5 w-3/4 bg-slate-200" />
                <Skeleton className="h-4 w-1/2 bg-slate-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productsData?.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Promotional Banner */}
      <section className="container mx-auto px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-12 lg:p-16">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                backgroundSize: "24px 24px",
              }}
            />
          </div>
          
          {/* Gradient Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <Badge className="bg-amber-500/20 text-amber-300 border-0 mb-4">
                <TrendingUp className="h-3 w-3 mr-1" />
                Limited Time Offer
              </Badge>
              <h3 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Get 20% Off<br />Your First Order
              </h3>
              <p className="text-slate-300 text-lg max-w-md">
                Sign up today and receive an exclusive discount on your first purchase.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold cursor-pointer shadow-lg shadow-amber-500/30 h-14 px-8 text-base transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/40"
                >
                  Claim Offer
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/products">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-600 text-white hover:bg-white/10 cursor-pointer h-14 px-8 text-base"
                >
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Bento Grid Style */}
      <section className="bg-white border-t border-slate-200">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Why Choose Us
            </h2>
            <p className="text-slate-500 mt-3 text-lg max-w-2xl mx-auto">
              We&apos;re committed to providing the best shopping experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-100 hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-500 cursor-default">
              <div className="w-14 h-14 rounded-xl bg-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Truck className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-heading font-semibold text-xl text-slate-900 mb-2">
                Free Shipping
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Enjoy free shipping on all orders over $100. No hidden fees.
              </p>
            </div>
            
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-500 cursor-default">
              <div className="w-14 h-14 rounded-xl bg-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-heading font-semibold text-xl text-slate-900 mb-2">
                Secure Payment
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Your transactions are protected with industry-leading encryption.
              </p>
            </div>
            
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100/50 border border-violet-100 hover:shadow-lg hover:shadow-violet-100/50 transition-all duration-500 cursor-default">
              <div className="w-14 h-14 rounded-xl bg-violet-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <RefreshCw className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-heading font-semibold text-xl text-slate-900 mb-2">
                Easy Returns
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Not satisfied? Return any item within 30 days for a full refund.
              </p>
            </div>
            
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-100 hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-500 cursor-default">
              <div className="w-14 h-14 rounded-xl bg-amber-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Package className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-heading font-semibold text-xl text-slate-900 mb-2">
                Premium Quality
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Every product is carefully selected to meet our quality standards.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
