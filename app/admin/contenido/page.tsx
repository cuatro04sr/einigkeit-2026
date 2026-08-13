"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Check,
  X,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
} from "lucide-react";

import { AdminHeader } from "@/components/admin/header";
import { Mission, ModerationItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/client";

type ModerationTab = "pending" | "approved";

export default function ModerationPage() {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ModerationTab>("pending");

  const supabase = createClient();

  // Carga inicial de datos paralela
  useEffect(() => {
    async function fetchPageData() {
      setLoading(true);
      try {
        const [missionsRes, responsesRes] = await Promise.all([
          supabase
            .from("missions")
            .select("id, title, subtitle, week_number, is_active, unlock_date")
            .order("week_number", { ascending: true }),
          supabase
            .from("user_responses")
            .select(
              "id, selected_option, text_answer, status, profiles(first_name, last_name)",
            )
            .in("status", ["pending", "approved"])
            .not("selected_option", "is", null),
        ]);

        if (missionsRes.error)
          console.error("Error al cargar misiones:", missionsRes.error);
        else setMissions(missionsRes.data || []);

        if (responsesRes.error) {
          toast.error("Error al cargar contenido");
        } else {
          setItems((responsesRes.data as unknown as ModerationItem[]) || []);
        }
      } catch (err) {
        console.error("Error inesperado:", err);
        toast.error("Error de conexión");
      } finally {
        setLoading(false);
      }
    }

    fetchPageData();
  }, [supabase]);

  // Actualización de estado optimizada
  const updateStatus = useCallback(
    async (id: string, status: "approved" | "rejected") => {
      const { error } = await supabase
        .from("user_responses")
        .update({ status })
        .eq("id", id);

      if (error) {
        toast.error("No se pudo actualizar el estado");
      } else {
        toast.success(
          `Contenido ${status === "approved" ? "aprobado" : "rechazado"}`,
        );
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status } : i)),
        );
      }
    },
    [supabase],
  );

  // Conteo dinámico y filtrado eficiente
  const counts = useMemo(
    () => ({
      pending: items.filter((i) => i.status === "pending").length,
      approved: items.filter((i) => i.status === "approved").length,
    }),
    [items],
  );

  const filteredItems = useMemo(() => {
    return items.filter((i) => i.status === activeTab);
  }, [items, activeTab]);

  if (loading) {
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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Moderación de <span className="text-amber-400">Fotos</span>
          </h1>
          <p className="text-sm font-medium mt-1 text-slate-500">
            Gestiona y visualiza las imágenes compartidas por los usuarios.
            (Pasa el cursor sobre la tarjeta para ver el texto).
          </p>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start">
          <TabButton
            active={activeTab === "pending"}
            onClick={() => setActiveTab("pending")}
            icon={<Clock className="w-4 h-4 text-amber-500" />}
            label="Pendientes"
            count={counts.pending}
          />
          <TabButton
            active={activeTab === "approved"}
            onClick={() => setActiveTab("approved")}
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            label="Aprobados"
            count={counts.approved}
          />
        </div>
      </div>

      {!filteredItems.length ? (
        <Card className="p-12 text-center text-slate-400 border-2 border-dashed rounded-xl shadow-none">
          <ImageIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
          <p>
            {activeTab === "pending"
              ? "No hay fotos pendientes de aprobación."
              : "No hay fotos aprobadas todavía."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const profile = Array.isArray(item.profiles)
              ? item.profiles[0]
              : item.profiles;
            const fullName = profile
              ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
              : "Anónimo";

            return (
              <div key={item.id} className="group h-80 [perspective:1000px]">
                <div className="relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                  {/* Frente (Imagen) */}
                  <div className="absolute inset-0 [backface-visibility:hidden] rounded-xl overflow-hidden shadow-md bg-slate-100 border border-slate-200">
                    <Image
                      src={item.selected_option}
                      alt="Respuesta del usuario"
                      fill
                      className="object-contain"
                    />
                  </div>

                  {/* Dorso (Contenido y Acciones) */}
                  <div className="absolute inset-0 h-full w-full bg-slate-900 text-white rounded-xl p-6 [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col justify-between shadow-lg">
                    <div>
                      <p className="text-xs text-amber-400 font-semibold mb-2 uppercase tracking-wider">
                        Respuesta del usuario:
                      </p>
                      <p className="text-base italic text-slate-200 line-clamp-4">
                        &quot;{item.text_answer || "Sin comentario"}&quot;
                      </p>
                      <p className="mt-4 text-xs font-medium text-slate-400">
                        Enviado por:{" "}
                        <span className="text-white font-semibold">
                          {fullName}
                        </span>
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {activeTab === "pending" ? (
                        <>
                          <Button
                            onClick={() => updateStatus(item.id, "approved")}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                          >
                            <Check className="w-4 h-4 mr-1" /> Aprobar
                          </Button>
                          <Button
                            onClick={() => updateStatus(item.id, "rejected")}
                            variant="destructive"
                            className="flex-1 cursor-pointer"
                          >
                            <X className="w-4 h-4 mr-1" /> Rechazar
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => updateStatus(item.id, "rejected")}
                          variant="destructive"
                          className="w-full cursor-pointer"
                        >
                          <X className="w-4 h-4 mr-1" /> Revocar / Rechazar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Subcomponente auxiliar para las pestañas para mantener el código DRY y limpio
function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
        active
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-500 hover:text-slate-900"
      }`}
    >
      {icon}
      {label} ({count})
    </button>
  );
}
