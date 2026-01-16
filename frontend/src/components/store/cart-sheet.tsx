"use client";

import { useAuth } from "@clerk/nextjs";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart, useUpdateCartItem, useRemoveFromCart } from "@/hooks/use-cart";
import { useCheckout } from "@/hooks/use-orders";
import { Minus, Plus, Trash2, ShoppingBag, Package, ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function CartSheet() {
  const { isSignedIn } = useAuth();
  const { data: cart, isLoading } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();
  const checkout = useCheckout();
  const router = useRouter();

  const subtotal = cart?.items?.reduce(
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
      // Error is handled in the hook
    }
  };

  if (!isSignedIn) {
    return (
      <div className="flex flex-col h-full p-6">
        <SheetHeader className="pb-6">
          <SheetTitle className="font-heading text-2xl text-slate-900">Shopping Cart</SheetTitle>
        </SheetHeader>
        <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
            <ShoppingBag className="h-12 w-12 text-slate-300" />
          </div>
          <div>
            <p className="text-slate-900 font-semibold mb-1">Sign in to view your cart</p>
            <p className="text-slate-500 text-sm">Your cart items will appear here</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full p-6">
        <SheetHeader className="pb-6">
          <SheetTitle className="font-heading text-2xl text-slate-900">Shopping Cart</SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-50">
              <Skeleton className="h-20 w-20 rounded-lg bg-slate-200" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-slate-200" />
                <Skeleton className="h-4 w-1/2 bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="flex flex-col h-full p-6">
        <SheetHeader className="pb-6">
          <SheetTitle className="font-heading text-2xl text-slate-900">Shopping Cart</SheetTitle>
        </SheetHeader>
        <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
            <ShoppingBag className="h-12 w-12 text-slate-300" />
          </div>
          <div>
            <p className="text-slate-900 font-semibold mb-1">Your cart is empty</p>
            <p className="text-slate-500 text-sm">Start shopping to add items to your cart</p>
          </div>
          <Link href="/products">
            <Button className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white rounded-full h-11 px-6">
              Browse Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 flex-shrink-0">
        <SheetTitle className="font-heading text-2xl text-slate-900">
          Shopping Cart
          <span className="ml-2 text-base font-normal text-slate-500">
            ({cart.items.length} items)
          </span>
        </SheetTitle>
      </div>

      {/* Cart Items */}
      <ScrollArea className="flex-1 px-6 min-h-0">
        <div className="space-y-4 py-6">
          {cart.items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 group hover:border-slate-200 transition-colors">
              {/* Product Image */}
              <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-white border border-slate-200 flex-shrink-0">
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
                    <Package className="h-8 w-8 text-slate-300" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-slate-900 line-clamp-2">
                    {item.product.name}
                  </h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFromCart.mutate(item.id)}
                    disabled={removeFromCart.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-lg font-mono font-bold text-amber-600 mt-1">
                  ${Number(item.product.price).toFixed(2)}
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center border border-slate-200 rounded-full bg-white">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer rounded-full hover:bg-slate-100"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={updateCartItem.isPending}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-semibold w-8 text-center text-slate-900">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer rounded-full hover:bg-slate-100"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={updateCartItem.isPending}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="text-sm text-slate-500">
                    × ${Number(item.product.price).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-slate-200 p-6 space-y-4 bg-white flex-shrink-0">
        {/* Free Shipping Notice */}
        {subtotal < 100 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <Sparkles className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              Add <span className="font-semibold">${(100 - subtotal).toFixed(2)}</span> more for free shipping!
            </p>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-slate-600">Subtotal</span>
          <span className="text-2xl font-mono font-bold text-slate-900">${subtotal.toFixed(2)}</span>
        </div>
        
        <Button
          className="w-full cursor-pointer bg-slate-900 hover:bg-slate-800 text-white h-14 text-base font-semibold rounded-full shadow-lg transition-all duration-300 hover:shadow-xl"
          onClick={handleCheckout}
          disabled={checkout.isPending}
        >
          {checkout.isPending ? "Processing..." : "Proceed to Checkout"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        
        <p className="text-xs text-center text-slate-500">
          Shipping and taxes calculated at checkout
        </p>
      </div>
    </div>
  );
}
