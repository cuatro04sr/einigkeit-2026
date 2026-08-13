"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlumniTable } from "@/components/admin/alumni-table";
import { AdminHeader } from "@/components/admin/header";
import { useAuthStore } from "@/store/useAuthStore";
import { createClient } from "@/lib/client";
import { Mission, Profile } from "@/types";

import { useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminAlumniPage() {
  const router = useRouter();
  const { profile, isLoading } = useAuthStore();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [profilesList, setProfilesList] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const supabase = createClient();
  useEffect(() => {
    if (!isLoading && profile?.app_role !== "admin") {
      router.push("/login");
    }
  }, [isLoading, profile, router]);
  useEffect(() => {
    async function fetchAlumniData() {
      try {
        setIsDataLoading(true);
        setErrorMessage(null);
        const [missionsRes, profilesRes] = await Promise.all([
          supabase
            .from("missions")
            .select("id, title, subtitle, week_number, is_active, unlock_date")
            .order("week_number", { ascending: true }),
          supabase
            .from("profiles")
            .select(
              "id, first_name, last_name, abi, whatsapp, country, state, city, app_role, points, created_at",
            )
            .order("created_at", { ascending: false }),
        ]);
        if (missionsRes.error) {
          console.error("Error misiones:", missionsRes.error);
        }
        if (profilesRes.error) {
          console.error("Error exalumnos:", profilesRes.error);
          setErrorMessage("Ocurrió un error al cargar la lista de exalumnos.");
        }
        setMissions(missionsRes.data || []);
        setProfilesList(profilesRes.data || []);
      } catch (err) {
        console.error("Error inesperado en fetchAlumniData:", err);
        setErrorMessage("Error de conexión al obtener los datos.");
      } finally {
        setIsDataLoading(false);
      }
    }
    if (profile?.app_role === "admin") {
      fetchAlumniData();
    }
  }, [profile, supabase]);
  const filteredProfiles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return profilesList;
    return profilesList.filter((p) => {
      const fullName =
        `${p.first_name || ""} ${p.last_name || ""}`.toLowerCase();
      const whatsapp = (p.whatsapp || "").toLowerCase();
      const abi = (p.abi || "").toLowerCase();
      const city = (p.city || "").toLowerCase();
      const state = (p.state || "").toLowerCase();
      const country = (p.country || "").toLowerCase();
      return (
        fullName.includes(query) ||
        whatsapp.includes(query) ||
        abi.includes(query) ||
        city.includes(query) ||
        state.includes(query) ||
        country.includes(query)
      );
    });
  }, [profilesList, searchQuery]);
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
          Vista de <span className="text-amber-400">exalumnos</span>
        </h2>
        <p className="text-sm font-medium mt-1 text-slate-500">
          Directorio general de miembros registrados en la plataforma.
        </p>
      </div>
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      <AlumniTable profiles={filteredProfiles} loading={isDataLoading} />
    </div>
  );
}
