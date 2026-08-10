"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export function WallProgressCard() {
  return (
    <Card className="rounded-2xl border-none shadow-sm bg-white p-6 space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Progreso del muro</h3>

      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 36 36"
          >
            <path
              className="text-amber-100"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-amber-400"
              strokeDasharray="70, 100"
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-slate-900 leading-none">
              70%
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5">
              del objetivo
            </span>
          </div>
        </div>

        <div>
          <p className="text-2xl font-black text-slate-900 leading-tight">
            1.400{" "}
            <span className="text-sm font-bold text-slate-500">de 2000</span>
          </p>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Exalumnos registrados
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
          <span
            key={num}
            className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center text-xs font-semibold text-slate-700"
          >
            {num}
          </span>
        ))}
      </div>

      <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors">
        <span>Ver muro completo</span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </Card>
  );
}
