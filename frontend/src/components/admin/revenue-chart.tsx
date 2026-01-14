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

interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
  }>;
  total: number;
}

export function RevenueChart({ data, total }: RevenueChartProps) {
  return (
    <Card className="bg-white border-slate-200 overflow-hidden">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-500" />
              Revenue Overview
            </CardTitle>
            <CardDescription className="text-slate-500 mt-1">
              Monthly revenue trend for the current period
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold font-mono text-slate-900">
              ${total.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 flex items-center justify-end gap-1">
              <Calendar className="h-3 w-3" />
              Total Revenue
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-2">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickMargin={12}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickMargin={12}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                  padding: "12px 16px",
                }}
                labelStyle={{
                  color: "#1e293b",
                  fontWeight: "600",
                  marginBottom: "4px",
                }}
                itemStyle={{
                  color: "#f59e0b",
                  fontWeight: "500",
                }}
                formatter={(value) => [`$${(value as number).toLocaleString()}`, "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{
                  r: 6,
                  fill: "#f59e0b",
                  stroke: "#ffffff",
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
