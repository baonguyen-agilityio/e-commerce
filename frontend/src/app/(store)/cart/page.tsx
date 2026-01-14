"use client";

import { useAuth } from "@clerk/nextjs";
import { useCart, useUpdateCartItem, useRemoveFromCart } from "@/hooks/use-cart";
import { useCheckout } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { isSignedIn } = useAuth();
  const { data: cart, isLoading } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();
  const checkout = useCheckout();
  const router = useRouter();

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

  const handleCheckout = async () => {
    try {
      await checkout.mutateAsync();
      router.push("/orders");
    } catch (error) {
      // Error handled in hook
    }
  };

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-heading text-2xl font-bold mb-2">
          Sign in to view your cart
        </h2>
        <p className="text-muted-foreground mb-6">
          Create an account or sign in to start shopping
        </p>
        <Link href="/sign-in">
          <Button className="cursor-pointer">Sign In</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-heading text-2xl font-bold mb-2">
          Your cart is empty
        </h2>
        <p className="text-muted-foreground mb-6">
          Looks like you haven&apos;t added anything to your cart yet
        </p>
        <Link href="/products">
          <Button className="cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-heading text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                    {item.product.imageUrl ? (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.product.id}`}
                      className="font-medium hover:text-accent transition-colors cursor-pointer"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      ${Number(item.product.price).toFixed(2)} each
                    </p>

                    <div className="flex items-center gap-4 mt-3">
                      {/* Quantity */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 cursor-pointer"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          disabled={updateCartItem.isPending}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 cursor-pointer"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          disabled={updateCartItem.isPending}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Remove */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive cursor-pointer"
                        onClick={() => removeFromCart.mutate(item.id)}
                        disabled={removeFromCart.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="text-right">
                    <p className="font-mono font-semibold">
                      ${(Number(item.product.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="font-heading text-lg font-semibold mb-4">
                Order Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-mono">Calculated at checkout</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="font-mono text-lg">${subtotal.toFixed(2)}</span>
              </div>

              <Button
                className="w-full mt-6 cursor-pointer bg-accent hover:bg-accent/90 text-accent-foreground"
                size="lg"
                onClick={handleCheckout}
                disabled={checkout.isPending}
              >
                {checkout.isPending ? "Processing..." : "Proceed to Checkout"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <Link href="/products" className="block mt-4">
                <Button variant="ghost" className="w-full cursor-pointer">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

