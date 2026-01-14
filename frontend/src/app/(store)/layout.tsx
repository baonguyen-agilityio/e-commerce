"use client";

import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
