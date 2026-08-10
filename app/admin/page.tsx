"use client";

import { RecentActivityTable } from "@/components/admin/recent-activity-table";
import { GeographicScopeCard } from "@/components/admin/geographic-scope-card";
import { WallProgressCard } from "@/components/admin/wall-progress-card";
import { GeoLocation, Mission, RecentActivity, StatItem } from "@/types";
import { AdminHeader } from "@/components/admin/header";
import { useAuthStore } from "@/store/useAuthStore";
import { Stats } from "@/components/admin/stats";
import { createClient } from "@/lib/client";

import { Award, CheckSquare, ImageIcon, Loader2, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { profile, isLoading } = useAuthStore();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [profilesCount, setProfilesCount] = useState<number>(0);
  const [completedMissionsCount, setCompletedMissionsCount] =
    useState<number>(0);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [locations, setLocations] = useState<GeoLocation[]>([]);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(true);
  const supabase = createClient();
  useEffect(() => {
    if (!isLoading && profile?.app_role !== "admin") {
      router.push("/login");
    }
  }, [isLoading, profile, router]);
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsStatsLoading(true);
        const [
          missionsRes,
          profilesRes,
          responsesRes,
          activitiesRes,
          locationsRes,
        ] = await Promise.all([
          supabase
            .from("missions")
            .select("id, title, subtitle, week_number, is_active, unlock_date")
            .order("week_number", { ascending: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.rpc("get_completed_missions_count"),
          supabase.rpc("get_recent_mission_activity", { limit_count: 5 }),
          supabase.rpc("get_geographic_locations"),
        ]);
        if (missionsRes.error)
          console.error("Error al obtener misiones:", missionsRes.error);
        if (profilesRes.error)
          console.error("Error al contar perfiles:", profilesRes.error);
        if (responsesRes.error)
          console.error("Error al contar respuestas:", responsesRes.error);
        if (activitiesRes.error)
          console.error(
            "Error obteniendo actividad reciente:",
            activitiesRes.error.message,
          );
        if (locationsRes.error)
          console.error("Error ubicaciones:", locationsRes.error.message);
        setMissions(missionsRes.data || []);
        setProfilesCount(profilesRes.count ?? 0);
        setCompletedMissionsCount(responsesRes.data ?? 0);
        setActivities(activitiesRes.data || []);
        setLocations(locationsRes.data || []);
      } catch (err) {
        console.error("Error inesperado en fetchDashboardData:", err);
      } finally {
        setIsStatsLoading(false);
      }
    }
    if (profile?.app_role === "admin") {
      fetchDashboardData();
    }
  }, [profile, supabase]);
  const statsData = useMemo<StatItem[]>(
    () => [
      {
        id: "profiles",
        title: "Exalumnos registrados",
        value: profilesCount.toLocaleString("es-CO"),
        icon: Users,
        iconColor: "text-amber-500",
        bgColor: "bg-amber-100/70",
      },
      {
        id: "pending-content",
        title: "Contenidos por aprobar",
        value: (0).toLocaleString("es-CO"),
        icon: ImageIcon,
        iconColor: "text-rose-500",
        bgColor: "bg-rose-100/70",
      },
      {
        id: "missions",
        title: "Misiones completadas",
        value: completedMissionsCount.toLocaleString("es-CO"),
        icon: Award,
        iconColor: "text-sky-500",
        bgColor: "bg-sky-100/70",
      },
      {
        id: "confirmations",
        title: "Confirmaciones recibidas",
        value: (0).toLocaleString("es-CO"),
        icon: CheckSquare,
        iconColor: "text-emerald-600",
        bgColor: "bg-emerald-100/70",
      },
    ],
    [profilesCount, completedMissionsCount],
  );
  if (isLoading || profile?.app_role !== "admin") {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }
  return (
    <div className="space-y-8 p-2 max-w-[1400px] mx-auto">
      <AdminHeader
        missions={missions}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Panel <span className="text-amber-400">administrativo</span>
        </h2>
        <p className="text-sm font-medium mt-1">
          Vista general de “Einigkeit” 2026.
        </p>
      </div>
      <Stats items={statsData} loading={isStatsLoading} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 space-y-4">
          <RecentActivityTable
            activities={activities}
            loading={isStatsLoading}
          />
          <GeographicScopeCard
            locations={locations}
            profilesCount={profilesCount}
            loading={isStatsLoading}
          />
        </div>
        <WallProgressCard />
      </div>
    </div>
  );
}
