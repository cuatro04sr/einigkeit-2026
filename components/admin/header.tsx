"use client";

import { Search, Download, Loader2 } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/client";
import { downloadCSV } from "@/lib/utils";
import {
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
  Select,
} from "@/components/ui/select";
import {
  MissionResponseJoinedRecord,
  AdminHeaderProps,
  CSVExportRow,
  Profile,
} from "@/types";

export function AdminHeader({
  missions = [],
  searchQuery = "",
  onSearchChange,
}: AdminHeaderProps) {
  const [selectedMission, setSelectedMission] = useState<string>("todas");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const supabase = createClient();
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      let exportPayload: CSVExportRow[] = [];
      const dateStamp = new Date().toISOString().slice(0, 10);
      const filename = `reporte_einigkeit_${selectedMission}_${dateStamp}.csv`;
      if (selectedMission === "todas") {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            "id, first_name, last_name, abi, whatsapp, country, state, city, points, app_role, created_at",
          );
        if (error) throw error;
        const profiles = (data ?? []) as Profile[];
        exportPayload = profiles.map((p) => ({
          "ID Usuario": p.id,
          Nombre: p.first_name,
          Apellido: p.last_name,
          "Promoción (ABI)": p.abi,
          WhatsApp: p.whatsapp,
          País: p.country,
          Departamento: p.state,
          Ciudad: p.city,
          Puntos: p.points,
          Rol: p.app_role,
          "Fecha Registro": p.created_at
            ? new Date(p.created_at).toLocaleString()
            : "N/A",
        }));
      } else {
        const { data, error } = await supabase
          .from("user_responses")
          .select(
            `
            id,
            created_at,
            selected_option,
            text_answer,
            is_correct,
            points_earned,
            profiles (first_name, last_name, abi, whatsapp, country, city),
            missions (title, week_number),
            questions (question_text, question_type)
          `,
          )
          .eq("mission_id", selectedMission);
        if (error) throw error;
        const responses = (data ??
          []) as unknown as MissionResponseJoinedRecord[];
        exportPayload = responses.map((r) => ({
          "Fecha Respuesta": new Date(r.created_at).toLocaleString(),
          "Semana Misión": r.missions?.week_number ?? "N/A",
          Misión: r.missions?.title ?? "N/A",
          Exalumno:
            `${r.profiles?.first_name ?? ""} ${r.profiles?.last_name ?? ""}`.trim(),
          "ABI (Promoción)": r.profiles?.abi ?? "N/A",
          WhatsApp: r.profiles?.whatsapp ?? "N/A",
          Ubicación: `${r.profiles?.city ?? ""}, ${r.profiles?.country ?? ""}`,
          Pregunta: r.questions?.question_text ?? "N/A",
          "Opción Seleccionada": r.selected_option,
          "Respuesta Texto": r.text_answer || "N/A",
          "¿Es Correcta?": r.is_correct ? "Sí" : "No",
          "Puntos Ganados": r.points_earned,
        }));
      }
      if (exportPayload.length === 0) {
        alert("No se encontraron registros para exportar.");
        return;
      }
      downloadCSV(exportPayload, filename);
    } catch (err) {
      console.error("Error exportando reporte CSV:", err);
      alert("Error al procesar la exportación.");
    } finally {
      setIsExporting(false);
    }
  };
  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="relative w-60 h-12">
          <Image
            src="/logos/einigkeit-logo.png"
            alt="Einigkeit Logo"
            fill
            className="object-contain object-left"
            priority
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Buscar exalumno, contenido..."
            className="pl-9 bg-white border-slate-200 rounded-xl text-xs h-10 shadow-sm"
          />
        </div>
        <Select value={selectedMission} onValueChange={setSelectedMission}>
          <SelectTrigger className="w-[170px] bg-white border-slate-200 rounded-xl text-xs h-10 shadow-sm">
            <SelectValue placeholder="Todas las misiones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Global (Usuarios)</SelectItem>
            {missions.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                Misión {m.week_number}: {m.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleExportCSV}
          disabled={isExporting}
          variant="outline"
          className="bg-white border-slate-200 rounded-xl text-xs h-10 shadow-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          {isExporting ? (
            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin text-amber-500" />
          ) : (
            <Download className="w-3.5 h-3.5 mr-2 text-slate-500" />
          )}
          Exportar CSV
        </Button>
      </div>
    </header>
  );
}
