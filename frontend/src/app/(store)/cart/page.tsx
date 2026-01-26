"use client";

import { useAuth } from "@clerk/nextjs";
import { useCart, useUpdateCartItem, useRemoveFromCart } from "@/hooks/use-cart";
import { useCheckout } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Minus, Plus, Trash2, ArrowLeft, ArrowRight, Sprout, ShieldCheck, Leaf } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PaymentForm } from "@/components/payment-form";
import { useState } from "react";

export default function CartPage() {
  const { isSignedIn } = useAuth();
  const { data: cart, isLoading } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();
  const checkout = useCheckout();
  const router = useRouter();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const subtotal =
    cart?.items?.reduce(
      (acc, item) => acc + Number(item.product.price) * item.quantity,
      0
    ) || 0;

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart.mutate(itemId);
    } else {
      updateCartItem.mutate({ itemId, quantity: newQuantity });
    }
  };

  const handleCheckout = async (paymentMethodId: string) => {
    try {
      const response = await checkout.mutateAsync(paymentMethodId);
      setIsCheckoutOpen(false);
      router.push(`/checkout/success?orderId=${response.order.id}`);
    } catch (error) {
      // Error handled in hook
    }
  };

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary mx-auto mb-6">
          <Sprout className="h-12 w-12 text-muted-foreground/50" />
        </div>
        <h2 className="font-heading text-3xl font-bold mb-3 text-foreground">
          Sign in to tend your garden
        </h2>
        <p className="text-muted-foreground mb-8 text-lg">
          Create an account or sign in to view your selection
        </p>
        <Link href="/sign-in">
          <Button size="lg" className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
            Sign In to Account
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-12 w-64 mb-12 bg-secondary/30" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-3xl bg-secondary/30" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-3xl bg-secondary/30" />
        </div>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-secondary mx-auto mb-8 animate-pulse">
          <Leaf className="h-16 w-16 text-primary/40" />
        </div>
        <h2 className="font-heading text-4xl font-black mb-4 text-foreground tracking-tight">
          Your garden is currently empty
        </h2>
        <p className="text-muted-foreground mb-10 text-xl font-medium">
          Let's find some beautiful greenery to fill it with
        </p>
        <Link href="/products">
          <Button size="lg" className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/20">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Explore the Nursery
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-heading text-4xl font-black mb-12 text-foreground tracking-tight flex items-center gap-4">
        Your Garden
        <span className="text-base font-bold bg-secondary text-primary px-4 py-1 rounded-full">{cart.items.length} items</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cart.items.map((item) => (
            <div key={item.id} className="group flex gap-6 p-6 rounded-[2rem] bg-card border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5">
              {/* Image */}
              <div className="relative h-32 w-32 rounded-2xl overflow-hidden bg-secondary/50 flex-shrink-0 border border-border">
                {item.product.imageUrl ? (
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="128px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Sprout className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <Link
                      href={`/products/${item.product.id}`}
                      className="font-heading text-xl font-bold text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <p className="font-black text-xl text-primary tracking-tight">
                      {formatCurrency(Number(item.product.price) * item.quantity)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {formatCurrency(item.product.price)} per unit
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 mt-4">
                  {/* Quantity */}
                  <div className="flex items-center ring-1 ring-border rounded-xl bg-secondary/30 p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 cursor-pointer rounded-lg hover:bg-background hover:shadow-sm"
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                      disabled={updateCartItem.isPending}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center font-bold text-foreground">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 cursor-pointer rounded-lg hover:bg-background hover:shadow-sm"
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                      disabled={updateCartItem.isPending}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Remove */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-red-500 hover:bg-red-50 cursor-pointer rounded-xl px-4 h-11 transition-all"
                    onClick={() => removeFromCart.mutate(item.id)}
                    disabled={removeFromCart.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Compost
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="p-8 rounded-[2rem] bg-secondary/20 border border-border backdrop-blur-xl">
              <h2 className="font-heading text-2xl font-bold mb-6 text-foreground">
                Garden Summary
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground font-medium">Subtotal</span>
                  <span className="font-black text-foreground">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground font-medium">Shipping estimate</span>
                  <span className="font-medium text-foreground">Calculated next step</span>
                </div>
                {subtotal >= 100 && (
                  <div className="flex items-center gap-2 text-sm font-bold text-primary bg-primary/10 p-3 rounded-xl">
                    <Sprout className="h-4 w-4 fill-primary" />
                    Complimentary Shipping Qualified
                  </div>
                )}
              </div>

              <Separator className="bg-border/50 mb-8" />

              <div className="flex justify-between items-baseline mb-8">
                <span className="font-bold text-lg text-foreground">Total</span>
                <span className="font-black text-3xl text-foreground tracking-tighter">{formatCurrency(subtotal)}</span>
              </div>

              <Button
                className="w-full h-14 text-lg font-bold rounded-2xl cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 transition-all active:scale-95 group"
                onClick={() => setIsCheckoutOpen(true)}
                disabled={checkout.isPending}
              >
                Proceed to Checkout
                <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-70">
                <ShieldCheck className="h-4 w-4" />
                Secure SSL Encryption
              </div>
            </div>

            <Link href="/products" className="block text-center">
              <Button variant="ghost" className="cursor-pointer text-muted-foreground hover:text-primary font-bold">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Exploring
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[450px] bg-card border-border rounded-[2.5rem] p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="font-heading text-3xl font-black tracking-tight flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-primary" />
              Secure Checkout
            </DialogTitle>
            <DialogDescription className="text-base font-medium">
              You are about to pay <strong>{formatCurrency(subtotal)}</strong> for your garden selection.
            </DialogDescription>
          </DialogHeader>

          <PaymentForm
            amount={subtotal}
            onSuccess={handleCheckout}
            isPending={checkout.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
