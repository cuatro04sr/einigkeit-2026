"use client";

import { GeographicScopeCardProps } from "@/types";
import { Card } from "@/components/ui/card";

import { useMemo } from "react";

export function GeographicScopeCard({
  locations = [],
  profilesCount,
  loading = false,
}: GeographicScopeCardProps) {
  const { countriesCount, citiesCount } = useMemo(() => {
    return {
      countriesCount: new Set(locations.map((l) => l.country)).size,
      citiesCount: new Set(locations.map((l) => l.city)).size,
    };
  }, [locations]);
  return (
    <Card className="rounded-2xl border-none shadow-sm bg-white p-6">
      <h3 className="text-base font-bold text-slate-900 mb-4">
        Alcance geográfico
      </h3>
      <div className="grid grid-cols-3 divide-x divide-slate-200 text-center">
        <div className="px-2">
          {loading ? (
            <div className="h-8 w-12 bg-slate-100 animate-pulse rounded mx-auto mb-1" />
          ) : (
            <p className="text-2xl font-black text-slate-900">
              {countriesCount.toLocaleString("es-CO")}
            </p>
          )}
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">
            Países conectados
          </p>
        </div>
        <div className="px-2">
          {loading ? (
            <div className="h-8 w-12 bg-slate-100 animate-pulse rounded mx-auto mb-1" />
          ) : (
            <p className="text-2xl font-black text-slate-900">
              {citiesCount.toLocaleString("es-CO")}
            </p>
          )}
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">
            Ciudades activas
          </p>
        </div>
        <div className="px-2">
          {loading ? (
            <div className="h-8 w-16 bg-slate-100 animate-pulse rounded mx-auto mb-1" />
          ) : (
            <p className="text-2xl font-black text-slate-900">
              {profilesCount.toLocaleString("es-CO")}
            </p>
          )}
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">
            Exalumnos registrados
          </p>
        </div>
      </div>
    </Card>
  );
}
