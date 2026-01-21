"use client";

import { useAuth } from "@clerk/nextjs";

import { Hero } from "@/components/store/hero";
import { ProductCard } from "@/components/store/product-card";
import { useProducts } from "@/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Package, Shield, RefreshCw, Truck, Sparkles, TrendingUp, HandHeart, Sprout, Sun } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function Home() {
  const { isSignedIn } = useAuth();
  const { data: products, isLoading } = useProducts({ limit: 8, isActive: true });

  return (
    <div className="bg-background">
      <Hero />

      {/* Featured Products Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <Badge className="bg-secondary text-primary border-0 mb-3">
              <Sprout className="h-3 w-3 mr-1" />
              Fresh from the Nursery
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Featured Greenery
            </h2>
            <p className="text-muted-foreground mt-2 text-lg">
              Discover our handpicked selection of thriving plants and viable seeds
            </p>
          </div>
          <Link href="/products">
            <Button
              variant="outline"
              className="cursor-pointer group border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 h-11 px-6 rounded-xl"
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
                <Skeleton className="aspect-[4/5] rounded-3xl bg-secondary/50" />
                <Skeleton className="h-5 w-3/4 bg-secondary/50" />
                <Skeleton className="h-4 w-1/2 bg-secondary/50" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products?.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Promotional Banner - Only show for non-signed-in users */}
      {!isSignedIn && (
        <section className="container mx-auto px-4 pb-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-emerald-800 to-primary p-8 md:p-12 lg:p-16">
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
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <Badge className="bg-white/10 text-white border-0 mb-4 backdrop-blur-md">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Seasonal Offer
                </Badge>
                <h3 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                  Grow Your Journey<br />With 20% Off
                </h3>
                <p className="text-primary-foreground/80 text-lg max-w-md">
                  Sign up today and receive an exclusive discount on your first order of seeds or plants.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-white font-semibold cursor-pointer shadow-lg shadow-accent/20 h-14 px-8 text-base transition-all duration-300 hover:shadow-xl hover:shadow-accent/30 rounded-xl"
                  >
                    Claim Offer
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/products">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 bg-transparent cursor-pointer h-14 px-8 text-base rounded-xl"
                  >
                    Browse Products
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section - Bento Grid Style */}
      <section className="bg-secondary/20 border-t border-border">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Our Promise to You
            </h2>
            <p className="text-muted-foreground mt-3 text-lg max-w-2xl mx-auto">
              We&apos;re committed to sustainability and your gardening success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-white to-secondary/30 border border-border hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 cursor-default">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Truck className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                Carbon Neutral Shipping
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                We offset 100% of carbon emissions for every delivery to your doorstep.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-br from-white to-secondary/30 border border-border hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 cursor-default">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                Germination Guarantee
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                We guarantee our seeds will sprout or we'll replace them for free.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-br from-white to-secondary/30 border border-border hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 cursor-default">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sun className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                Organic Certified
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                All our seeds and soil mixes are 100% certified organic and non-GMO.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-br from-white to-secondary/30 border border-border hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 cursor-default">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <HandHeart className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                Expert Support
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Our horticulturists are available to help you with plant care questions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
