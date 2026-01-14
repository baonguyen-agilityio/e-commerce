"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  iconClassName,
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        "group cursor-pointer overflow-hidden bg-white border-slate-200 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-300",
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight text-slate-900 font-mono">
                {value}
              </p>
              {trend && (
                <span
                  className={cn(
                    "text-xs font-semibold px-1.5 py-0.5 rounded-full",
                    trend.isPositive
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-red-700 bg-red-50"
                  )}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-slate-400">{description}</p>
            )}
          </div>
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110",
              iconClassName || "bg-amber-50"
            )}
          >
            <Icon
              className={cn(
                "h-6 w-6 transition-colors",
                iconClassName ? "text-current" : "text-amber-600"
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
