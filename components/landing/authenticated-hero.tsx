"use client";

import { MissionsCardsGrid } from "@/components/landing/mission-cards-grid";
import { useAuthStore } from "@/store/useAuthStore";
import { createClient } from "@/lib/client";
import { Mission } from "@/types";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { MascotCallout } from "../shared/mascot-callout";

const supabase = createClient();

export function AuthenticatedHero() {
  const { user } = useAuthStore();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const [missionsRes, responsesRes] = await Promise.all([
          supabase
            .from("missions")
            .select("*")
            .order("week_number", { ascending: true }),
          supabase
            .from("user_responses")
            .select("mission_id")
            .eq("user_id", user!.id),
        ]);
        if (missionsRes.error) throw missionsRes.error;
        if (responsesRes.error) throw responsesRes.error;
        if (missionsRes.data) setMissions(missionsRes.data as Mission[]);
        if (responsesRes.data) {
          const uniqueMissions = new Set(
            responsesRes.data.map((r) => r.mission_id),
          );
          setCompletedCount(uniqueMissions.size);
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Error al cargar los datos";
        toast.error("Ocurrió un error", { description: message });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);
  const totalMissions = missions.length;
  const percentage = useMemo(() => {
    if (totalMissions === 0) return 0;
    return Math.round((completedCount / totalMissions) * 100);
  }, [completedCount, totalMissions]);
  return (
    <section className="relative w-full max-w-7xl mx-auto py-6">
      <div className="relative z-10 w-full px-8 sm:px-16 md:px-24 lg:px-32 flex flex-col gap-6 lg:gap-8">
        <header className="w-full">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex-1 space-y-2 text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                Misiones semanales <br className="hidden sm:inline" />
                <span className="text-blue-600 block sm:inline">
                  para participantes
                </span>
              </h1>
              <p className="text-slate-600 text-base sm:text-lg font-medium">
                Cada misión nos acerca a nuestra historia compartida.
              </p>
            </div>
            <div className="w-full lg:w-[420px] bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold tracking-wide">
                <span className="text-slate-900 uppercase">
                  PROGRESO GENERAL
                </span>
                <span className="text-red-600 font-extrabold">
                  {completedCount}/{totalMissions} misiones completadas
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-red-600 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="space-y-1 text-xs sm:text-sm">
                <p className="text-slate-500 font-medium">
                  {percentage}% completado
                </p>
                <p className="text-red-600 font-bold">
                  Fecha límite: 28 de septiembre de 2026
                </p>
              </div>
            </div>
          </div>
        </header>
        <div className="relative w-full flex flex-col lg:flex-row items-center lg:items-start gap-4">
          <div className="w-full flex-1 min-w-0">
            <MissionsCardsGrid missions={missions} isLoading={loading} />
          </div>
          <div className="w-full lg:w-fit h-full flex justify-center lg:justify-end lg:sticky lg:top-6">
            <MascotCallout
              imageSrc="/otto-rabbit-2.png"
              message={
                <>
                  Completa las misiones, acumula puntos, diviértete y prepárate
                  para las <span className="text-red-600">sorpresas.</span>
                </>
              }
              orientation="vertical"
              className="!max-w-[160px] [&>div:last-child]:!w-[180px] [&>div:last-child]:!h-[320px] [&_img]:!object-cover [&_img]:!object-top"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
