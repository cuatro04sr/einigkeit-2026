"use client";

import { WallProgressCardProps } from "@/types";
import { Card } from "@/components/ui/card";

import { Check, Lock } from "lucide-react";
import { useMemo } from "react";

export function WallProgressCard({
  registeredProfiles = 0,
  targetProfiles = 2000,
  missions = [],
  loading = false,
}: WallProgressCardProps) {
  const TOTAL_MISSIONS = 8;
  const { activeWeeks, unlockedCount, percentage } = useMemo(() => {
    const now = new Date();
    const active = missions.filter(
      (m) => m.is_active && new Date(m.unlock_date) <= now,
    );
    const activeSet = new Set(active.map((m) => m.week_number));
    const count = activeSet.size;
    const pct = Math.round((count / TOTAL_MISSIONS) * 100);
    return {
      activeWeeks: activeSet,
      unlockedCount: count,
      percentage: pct,
    };
  }, [missions]);
  const missionArray = Array.from({ length: TOTAL_MISSIONS }, (_, i) => i + 1);
  return (
    <Card className="rounded-2xl border-none shadow-sm bg-white p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Progreso del Muro
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Meta global de la comunidad
          </p>
        </div>
        <span className="text-2xl font-black text-sky-600">
          {loading ? "--" : `${percentage}%`}
        </span>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-100">
          <div
            className="h-full bg-sky-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs font-semibold text-slate-500">
          <span>{unlockedCount} de 8 misiones activas</span>
          <span>
            {registeredProfiles.toLocaleString("es-CO")} /{" "}
            {targetProfiles.toLocaleString("es-CO")} exalumnos
          </span>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-700 mb-3">
          Semanas de Misiones
        </p>
        <div className="grid grid-cols-4 gap-2">
          {missionArray.map((weekNum) => {
            const isUnlocked = activeWeeks.has(weekNum);
            return (
              <div
                key={weekNum}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                  isUnlocked
                    ? "bg-sky-500 border-sky-500 text-white shadow-sm shadow-sky-200"
                    : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-1 mb-1">
                  {isUnlocked ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                </div>
                <span>Sem {weekNum}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
