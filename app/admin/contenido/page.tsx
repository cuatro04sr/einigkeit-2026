"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { saveAs } from "file-saver";
import Image from "next/image";
import { toast } from "sonner";
import JSZip from "jszip";
import {
  Image as ImageIcon,
  CheckCircle2,
  Download,
  Loader2,
  Check,
  Clock,
  X,
} from "lucide-react";

import { AdminHeader } from "@/components/admin/header";
import { useAuthStore } from "@/store/useAuthStore";
import { Mission, ModerationItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/client";

type ModerationTab = "pending" | "approved";

export default function ModerationPage() {
  const router = useRouter();
  const { profile, isLoading } = useAuthStore();
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<ModerationTab>("pending");
  const supabase = createClient();
  useEffect(() => {
    if (!isLoading && profile?.app_role !== "admin") router.push("/login");
  }, [isLoading, profile, router]);
  useEffect(() => {
    async function fetchPageData() {
      setLoading(true);
      try {
        const [missionsRes, responsesRes] = await Promise.all([
          supabase
            .from("missions")
            .select("id, title, subtitle, week_number, is_active, unlock_date")
            .order("week_number"),
          supabase
            .from("user_responses")
            .select(
              "id, selected_option, text_answer, status, profiles(first_name, last_name)",
            )
            .in("status", ["pending", "approved"])
            .not("selected_option", "is", null),
        ]);
        if (missionsRes.error) console.error(missionsRes.error);
        else setMissions(missionsRes.data || []);
        if (responsesRes.error) toast.error("Error al cargar contenido");
        else setItems((responsesRes.data as unknown as ModerationItem[]) || []);
      } catch (err) {
        console.error(err);
        toast.error("Error de conexión");
      } finally {
        setLoading(false);
      }
    }
    fetchPageData();
  }, [supabase]);
  const updateStatus = useCallback(
    async (id: string, status: "approved" | "rejected") => {
      const { error } = await supabase
        .from("user_responses")
        .update({ status })
        .eq("id", id);
      if (error) toast.error("No se pudo actualizar el estado");
      else {
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
  const handleDownloadZip = async () => {
    const approved = items.filter(
      (i) => i.status === "approved" && i.selected_option,
    );
    if (!approved.length) return toast.error("No hay imágenes aprobadas");
    setDownloading(true);
    const toastId = toast.loading(
      `Preparando archivo ZIP con ${approved.length} imágenes...`,
    );
    try {
      const zip = new JSZip();
      const folder = zip.folder("imagenes_aprobadas");
      for (const [idx, item] of approved.entries()) {
        const profile = Array.isArray(item.profiles)
          ? item.profiles[0]
          : item.profiles;
        const name =
          `${profile?.first_name || ""} ${profile?.last_name || ""}`
            .trim()
            .replace(/[^a-zA-Z0-9]/g, "_") || "anonimo";
        const ext =
          item.selected_option.split(".").pop()?.split("?")[0] || "png";
        const res = await fetch(item.selected_option);
        const blob = await res.blob();
        folder?.file(`aprobado_${idx + 1}_${name}.${ext}`, blob);
      }
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "imagenes_aprobadas.zip");
      toast.success("¡ZIP descargado con éxito!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Error al generar el archivo ZIP", { id: toastId });
    } finally {
      setDownloading(false);
    }
  };
  const counts = useMemo(
    () => ({
      pending: items.filter((i) => i.status === "pending").length,
      approved: items.filter((i) => i.status === "approved").length,
    }),
    [items],
  );
  const filteredItems = useMemo(
    () => items.filter((i) => i.status === activeTab),
    [items, activeTab],
  );
  if (loading)
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
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
            Gestiona y visualiza las imágenes compartidas.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {counts.approved > 0 && (
            <Button
              onClick={handleDownloadZip}
              disabled={downloading}
              className="bg-sky-600 hover:bg-sky-700 text-white cursor-pointer"
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Descargar ZIP ({counts.approved})
            </Button>
          )}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
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
      </div>
      {!filteredItems.length ? (
        <Card className="p-12 text-center text-slate-400 border-2 border-dashed rounded-xl shadow-none">
          <ImageIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
          <p>
            {activeTab === "pending"
              ? "No hay fotos pendientes."
              : "No hay fotos aprobadas."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const profile = Array.isArray(item.profiles)
              ? item.profiles[0]
              : item.profiles;
            const fullName =
              `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
              "Anónimo";
            return (
              <div key={item.id} className="group h-80 [perspective:1000px]">
                <div className="relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                  <div className="absolute inset-0 [backface-visibility:hidden] rounded-xl overflow-hidden shadow-md bg-slate-100 border border-slate-200">
                    <Image
                      src={item.selected_option}
                      alt="Respuesta"
                      fill
                      className="object-contain"
                    />
                  </div>

                  <div className="absolute inset-0 h-full w-full bg-slate-900 text-white rounded-xl p-6 [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col justify-between shadow-lg overflow-hidden">
                    <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                      <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider sticky top-0 bg-slate-900 py-1 z-10">
                        Respuesta:
                      </p>
                      <p className="text-sm italic text-slate-200 leading-relaxed break-words">
                        &quot;{item.text_answer || "Sin comentario"}&quot;
                      </p>
                      <p className="text-xs font-medium text-slate-400 pt-1">
                        Enviado por:{" "}
                        <span className="text-white font-semibold">
                          {fullName}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2 pt-3 mt-2 border-t border-slate-800 shrink-0">
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

function TabButton({
  onClick,
  active,
  label,
  count,
  icon,
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
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
    >
      {icon} {label} ({count})
    </button>
  );
}
