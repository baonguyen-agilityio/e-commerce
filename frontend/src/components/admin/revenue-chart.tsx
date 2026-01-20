"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
  }>;
  total: number;
}

export function RevenueChart({ data, total }: RevenueChartProps) {
  return (
    <Card className="bg-card border-border/50 overflow-hidden shadow-sm rounded-[2rem]">
      <CardHeader className="pb-0 pt-6 px-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Growth Overview
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Monthly organic revenue trend
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black font-heading text-foreground tracking-tight">
              {formatCurrency(total)}
            </p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-end gap-1">
              <Calendar className="h-3 w-3" />
              Total Harvest
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-4 px-6">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
                opacity={0.4}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12, fontWeight: 500 }}
                tickMargin={12}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12, fontWeight: 500 }}
                tickMargin={12}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "16px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                  padding: "12px 16px",
                }}
                labelStyle={{
                  color: "var(--foreground)",
                  fontWeight: "700",
                  fontFamily: "var(--font-heading)",
                  marginBottom: "4px",
                }}
                itemStyle={{
                  color: "var(--primary)",
                  fontWeight: "600",
                }}
                formatter={(value) => [formatCurrency(value as number), "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--primary)"
                strokeWidth={3}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{
                  r: 6,
                  fill: "var(--primary)",
                  stroke: "var(--background)",
                  strokeWidth: 3,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
