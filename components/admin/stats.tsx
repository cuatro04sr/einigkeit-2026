"use client";

import { Card } from "@/components/ui/card";
import { StatsProps } from "@/types";

export function Stats({ items, loading = false }: StatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.id}
            className="rounded-xl border border-slate-100 shadow-md shadow-slate-200/40 bg-white p-3 flex flex-row items-center gap-4 transition-all duration-200 hover:shadow-lg hover:shadow-slate-200/60"
          >
            <div
              className={`w-14 h-14 rounded-full ${stat.bgColor} flex items-center justify-center shrink-0`}
            >
              <Icon className={`w-7 h-7 ${stat.iconColor}`} />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <p className="text-sm font-semibold text-slate-700 tracking-tight leading-snug">
                {stat.title}
              </p>
              {loading ? (
                <div className="h-8 w-20 bg-slate-200 animate-pulse rounded mt-1" />
              ) : (
                <p className="text-2xl font-extrabold text-slate-950 tracking-tight mt-0.5">
                  {stat.value}
                </p>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
