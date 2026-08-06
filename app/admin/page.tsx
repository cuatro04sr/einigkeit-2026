"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

import {
  Search,
  Calendar,
  Download,
  Users,
  Image as ImageIcon,
  Award,
  CheckSquare,
  ChevronRight,
  Loader2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Datos de ejemplo para la tabla de actividad
const recentActivity = [
  {
    initials: "J",
    bg: "bg-purple-700",
    name: "Juan Valencia",
    action: "Registro",
    detail: "ABI 2005",
    date: "30 sep. 2026 10:32",
  },
  {
    initials: "L",
    bg: "bg-blue-600",
    name: "Laura Martínez",
    action: "Foto recibida",
    detail: "Galería ABI 1988",
    date: "30 sep. 2026 09:15",
  },
  {
    initials: "C",
    bg: "bg-rose-700",
    name: "Carlos Restrepo",
    action: "Misión Completada",
    detail: "Misión 2",
    date: "29 sep. 2026 17:48",
  },
  {
    initials: "P",
    bg: "bg-orange-600",
    name: "Ana P. Gómez",
    action: "Asistencia confirmada",
    detail: "Evento 3 de octubre",
    date: "29 sep. 2026 16:21",
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { profile, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && profile?.app_role !== "admin") {
      router.push("/login");
    }
  }, [isLoading, profile, router]);

  if (isLoading || profile?.app_role !== "admin") {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-2 max-w-[1400px] mx-auto">
      {/* 1. HEADER Y BARRA DE BÚSQUEDA */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          {/* Logo / Título de la marca */}
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              EINIGKEIT <span className="text-amber-500">2026</span>
            </h1>
            <div className="flex gap-1">
              <span className="w-4 h-1 bg-black rounded-full" />
              <span className="w-4 h-1 bg-red-600 rounded-full" />
              <span className="w-4 h-1 bg-amber-400 rounded-full" />
            </div>
          </div>
        </div>

        {/* Filtros superiores */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Buscador */}
          <div className="relative min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar exalumno, contenido"
              className="pl-9 bg-white border-slate-200 rounded-xl text-xs h-10 shadow-sm"
            />
          </div>

          {/* Select Misiones */}
          <Select defaultValue="todas">
            <SelectTrigger className="w-[160px] bg-white border-slate-200 rounded-xl text-xs h-10 shadow-sm">
              <SelectValue placeholder="Todas las misiones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las misiones</SelectItem>
              <SelectItem value="mision1">Misión 1</SelectItem>
              <SelectItem value="mision2">Misión 2</SelectItem>
            </SelectContent>
          </Select>

          {/* Select Año */}
          <Select defaultValue="2026">
            <SelectTrigger className="w-[110px] bg-white border-slate-200 rounded-xl text-xs h-10 shadow-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <SelectValue placeholder="2026" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>

          {/* Botón Exportar */}
          <Button
            variant="outline"
            className="bg-white border-slate-200 rounded-xl text-xs h-10 shadow-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="w-3.5 h-3.5 mr-2 text-slate-500" />
            Exportar reporte
          </Button>
        </div>
      </div>

      {/* 2. TÍTULO DEL PANEL */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Panel <span className="text-amber-400">administrativo</span>
        </h2>
        <p className="text-sm font-medium text-slate-400 mt-1">
          Vista general de “Einigkeit” 2026.
        </p>
      </div>

      {/* 3. TARJETAS DE ESTADÍSTICAS (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <Card className="rounded-2xl border-none shadow-sm bg-white p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100/60 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">
              Exalumnos registrados
            </p>
            <p className="text-2xl font-black text-slate-950 mt-0.5">1.278</p>
          </div>
        </Card>

        {/* KPI 2 */}
        <Card className="rounded-2xl border-none shadow-sm bg-white p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-100/60 flex items-center justify-center shrink-0">
            <ImageIcon className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">
              Contenidos por aprobar
            </p>
            <p className="text-2xl font-black text-slate-950 mt-0.5">48</p>
          </div>
        </Card>

        {/* KPI 3 */}
        <Card className="rounded-2xl border-none shadow-sm bg-white p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-sky-100/60 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-sky-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">
              Misiones completadas
            </p>
            <p className="text-2xl font-black text-slate-950 mt-0.5">642</p>
          </div>
        </Card>

        {/* KPI 4 */}
        <Card className="rounded-2xl border-none shadow-sm bg-white p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100/60 flex items-center justify-center shrink-0">
            <CheckSquare className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">
              Confirmaciones recibidas
            </p>
            <p className="text-2xl font-black text-slate-950 mt-0.5">412</p>
          </div>
        </Card>
      </div>

      {/* 4. SECCIÓN PRINCIPAL: ACTIVIDAD RECIENTE + PROGRESO DEL MURO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* COLUMNA IZQUIERDA (2 Cols): Actividad Reciente & Alcance Geográfico */}
        <div className="lg:col-span-2 space-y-6">
          {/* TABLA ACTIVIDAD RECIENTE */}
          <Card className="rounded-2xl border-none shadow-sm bg-white p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">
                Actividad reciente
              </h3>
              <Button
                variant="link"
                className="text-amber-500 font-bold text-xs p-0 h-auto hover:text-amber-600"
              >
                Ver todo
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="border-none hover:bg-transparent text-slate-400 font-bold text-xs">
                  <TableHead className="w-[180px]">Usuario</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Detalle</TableHead>
                  <TableHead className="text-right">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.map((item, index) => (
                  <TableRow
                    key={index}
                    className="border-none hover:bg-slate-50/60 transition-colors"
                  >
                    <TableCell className="font-semibold text-slate-900 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback
                            className={`${item.bg} text-white font-bold text-xs`}
                          >
                            {item.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-bold text-slate-800">
                          {item.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-600">
                      {item.action}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-500">
                      {item.detail}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-400 text-right">
                      {item.date}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* ALCANCE GEOGRÁFICO */}
          <Card className="rounded-2xl border-none shadow-sm bg-white p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Alcance geográfico
            </h3>
            <div className="grid grid-cols-3 divide-x divide-slate-200 text-center">
              <div className="px-2">
                <p className="text-2xl font-black text-slate-900">42</p>
                <p className="text-[11px] font-medium italic text-slate-500 mt-0.5">
                  Países conectados
                </p>
              </div>
              <div className="px-2">
                <p className="text-2xl font-black text-slate-900">128</p>
                <p className="text-[11px] font-medium italic text-slate-500 mt-0.5">
                  Ciudades activas
                </p>
              </div>
              <div className="px-2">
                <p className="text-2xl font-black text-slate-900">1.278</p>
                <p className="text-[11px] font-medium italic text-slate-500 mt-0.5">
                  Exalumnos registrados
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* COLUMNA DERECHA (1 Col): Progreso del Muro */}
        <Card className="rounded-2xl border-none shadow-sm bg-white p-6 space-y-6">
          <h3 className="text-lg font-bold text-slate-900">
            Progreso del muro
          </h3>

          {/* Dona de Progreso (SVG) */}
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
                <span className="text-sm font-bold text-slate-500">
                  de 2000
                </span>
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Exalumnos registrados
              </p>
            </div>
          </div>

          {/* Números Paginados / Pasos */}
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

          {/* Botón Rojo Muro Completo */}
          <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors">
            <span>Ver muro completo</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Card>
      </div>
    </div>
  );
}
