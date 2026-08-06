"use client";

import { MissionsCardsGrid } from "@/components/landing/mission-cards-grid";
import { MascotCallout } from "@/components/shared/mascot-callout";
import { useAuthStore } from "@/store/useAuthStore";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/client";
import { Mission } from "@/types";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Trophy } from "lucide-react";

const supabase = createClient();

export function AuthenticatedHero() {
  const { user } = useAuthStore();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [completedMissionIds, setCompletedMissionIds] = useState<Set<string>>(
    new Set(),
  );
  const [userResponses, setUserResponses] = useState<
    { mission_id: string; points_earned: number | null }[]
  >([]);
  const [perfectMissionIds, setPerfectMissionIds] = useState<Set<string>>(
    new Set(),
  );
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const [missionsRes, responsesRes, profileRes] = await Promise.all([
          supabase
            .from("missions")
            .select("*")
            .order("week_number", { ascending: true }),
          supabase
            .from("user_responses")
            .select("mission_id, points_earned, is_correct")
            .eq("user_id", user!.id),
          supabase.from("profiles").select("points").eq("id", user.id).single(),
        ]);
        if (missionsRes.error) throw missionsRes.error;
        if (responsesRes.error) throw responsesRes.error;
        if (missionsRes.data) setMissions(missionsRes.data as Mission[]);
        if (profileRes.data) setPoints(profileRes.data.points || 0);
        if (responsesRes.data) {
          setUserResponses(responsesRes.data);
          const uniqueMissions = new Set(
            responsesRes.data.map((r) => r.mission_id),
          );
          setCompletedMissionIds(uniqueMissions);
          const missionEvalMap: Record<
            string,
            { evaluatedCount: number; allTrue: boolean }
          > = {};
          responsesRes.data.forEach((r) => {
            if (r.is_correct === null) return;
            if (!missionEvalMap[r.mission_id]) {
              missionEvalMap[r.mission_id] = {
                evaluatedCount: 0,
                allTrue: true,
              };
            }
            missionEvalMap[r.mission_id].evaluatedCount += 1;
            if (r.is_correct === false) {
              missionEvalMap[r.mission_id].allTrue = false;
            }
          });
          const perfects = new Set<string>();
          Object.entries(missionEvalMap).forEach(([missionId, data]) => {
            if (data.evaluatedCount > 0 && data.allTrue) {
              perfects.add(missionId);
            }
          });
          setPerfectMissionIds(perfects);
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
  const pointsPerMission = useMemo(() => {
    const pointsMap: Record<string, number> = {};
    userResponses.forEach((res) => {
      if (!pointsMap[res.mission_id]) {
        pointsMap[res.mission_id] = 0;
      }
      pointsMap[res.mission_id] += res.points_earned || 0;
    });
    return pointsMap;
  }, [userResponses]);
  const totalMissions = missions.length;
  const completedCount = completedMissionIds.size;
  const percentage = useMemo(() => {
    if (totalMissions === 0) return 0;
    return Math.round((completedCount / totalMissions) * 100);
  }, [completedCount, totalMissions]);
  return (
    <section
      className="relative w-full max-w-7xl mx-auto py-6
                 bg-cover bg-center bg-no-repeat
                 bg-[url('/bg-mobile.png')]
                 lg:bg-[size:100%_100%] lg:bg-center
                 lg:bg-[url('/backgrounds/auth/bg-desktop.png')]"
    >
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
                <div className="flex flex-row justify-between items-center">
                  <p className="text-slate-500 font-medium">
                    {percentage}% completado
                  </p>
                  <Badge
                    variant="secondary"
                    className="bg-amber-50 text-amber-700 border border-amber-200/60 font-bold px-2.5 py-1 text-xs sm:text-sm gap-1.5 shrink-0 rounded-xl"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{points} pts</span>
                  </Badge>
                </div>
                <p className="text-red-600 font-bold">
                  Fecha límite: 28 de septiembre de 2026
                </p>
              </div>
            </div>
          </div>
        </header>
        <div className="relative w-full flex flex-col lg:flex-row items-center lg:items-start gap-4">
          <div className="w-full flex-1 min-w-0">
            <MissionsCardsGrid
              missions={missions}
              completedMissionIds={completedMissionIds}
              perfectMissionIds={perfectMissionIds}
              pointsPerMission={pointsPerMission}
              isLoading={loading}
            />
          </div>
          <div className="w-full lg:w-fit h-full flex justify-center lg:justify-center lg:sticky lg:top-6">
            <MascotCallout
              imageSrc="/mascot/otto-hero-auth.png"
              message={
                <>
                  Completa las misiones, acumula puntos, diviértete y prepárate
                  para las <span className="text-red-600">sorpresas.</span>
                </>
              }
              orientation="vertical"
              className="!max-w-[160px] [&>div:last-child]:!w-[190px] [&>div:first-child]:!translate-x-8 [&>div:first-child]:!-translate-y-4 [&>div:last-child]:!h-[300px] [&_img]:!object-cover [&_img]:!translate-x-8"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
