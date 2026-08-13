"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlumniTableProps } from "@/types";
import {
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Table,
} from "@/components/ui/table";
import {
  CardDescription,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
  Card,
} from "@/components/ui/card";
import {
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
  Tooltip,
} from "@/components/ui/tooltip";
import {
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
  Select,
} from "@/components/ui/select";

import { useState, useMemo } from "react";
import {
  GraduationCap,
  ChevronsRight,
  ChevronRight,
  ChevronsLeft,
  ChevronLeft,
  ShieldCheck,
  Calendar,
  MapPin,
  Trophy,
  Phone,
} from "lucide-react";

export function AlumniTable({ profiles, loading = false }: AlumniTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const totalPages = Math.max(1, Math.ceil(profiles.length / pageSize));
  const paginatedProfiles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return profiles.slice(start, start + pageSize);
  }, [profiles, currentPage, pageSize]);
  if (loading) {
    return (
      <Card className="rounded-2xl border-none shadow-sm">
        <CardHeader className="border-b border-slate-100/80 pb-4">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
      <CardHeader className="border-b border-slate-100 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">
              Exalumnos Registrados
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-medium mt-1">
              Mostrando {paginatedProfiles.length} de{" "}
              <span className="font-bold text-slate-700">
                {profiles.length}
              </span>
            </CardDescription>
          </div>
          <Badge
            variant="secondary"
            className="bg-amber-50 text-amber-700 border-amber-200"
          >
            {profiles.length} registros
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50/60">
            <TableRow className="border-b border-slate-100 hover:bg-transparent">
              <TableHead className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Exalumno
              </TableHead>
              <TableHead className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Ubicación
              </TableHead>
              <TableHead className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Promoción (Abi)
              </TableHead>
              <TableHead className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Puntos
              </TableHead>
              <TableHead className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Fecha Registro
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 font-medium">
            {paginatedProfiles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-36 text-center text-slate-400 font-medium"
                >
                  No se encontraron exalumnos que coincidan con la búsqueda.
                </TableCell>
              </TableRow>
            ) : (
              paginatedProfiles.map((p) => {
                const fullName =
                  [p.first_name, p.last_name].filter(Boolean).join(" ") ||
                  "Sin nombre";
                const initials = fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase();
                return (
                  <TableRow
                    key={p.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 bg-amber-100/80 text-amber-700 font-bold border border-amber-200/50">
                          <AvatarFallback className="bg-amber-100/80 text-amber-800 text-xs font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {fullName}
                            </span>
                            {p.app_role === "admin" && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="outline"
                                      className="px-1.5 py-0 text-[10px] font-black uppercase bg-amber-50 text-amber-700 border-amber-300 gap-1"
                                    >
                                      <ShieldCheck className="w-3 h-3 text-amber-600" />
                                      Admin
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Administrador del sistema
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 flex items-center gap-1 font-normal">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {p.whatsapp || "Sin contacto"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-700 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {[p.city, p.state, p.country]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-800 text-xs font-semibold">
                        <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-700 hover:bg-slate-100 font-bold"
                        >
                          {p.abi ? `${p.abi}` : "N/A"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                        <Trophy className="w-3.5 h-3.5 shrink-0" />
                        <span>{p.points ?? 0} pts</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {p.created_at
                          ? new Date(p.created_at).toLocaleDateString("es-CO", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Filas por página:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => {
              setPageSize(Number(val));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-16 h-8 text-xs bg-white border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs text-slate-600 font-medium">
            Página <span className="font-bold">{currentPage}</span> de{" "}
            <span className="font-bold">{totalPages}</span>
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-white"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-white"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-white"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-white"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
