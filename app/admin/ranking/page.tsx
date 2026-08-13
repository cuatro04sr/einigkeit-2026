"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronsRight,
  ChevronRight,
  ChevronsLeft,
  ChevronLeft,
  Loader2,
  Trophy,
  Camera,
  Users,
  Award,
  Star,
} from "lucide-react";

import { AdminHeader } from "@/components/admin/header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/useAuthStore";
import { Stats } from "@/components/admin/stats";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/client";
import {
  StatItem,
  Mission,
  AbiRankingItem,
  ProfileRow,
  UserResponseRow,
  AbiStats,
} from "@/types";
import {
  CardDescription,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
  Card,
} from "@/components/ui/card";
import {
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Table,
} from "@/components/ui/table";
import {
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
  Select,
} from "@/components/ui/select";

export default function RankingAdminPage() {
  const router = useRouter();
  const { profile, isLoading } = useAuthStore();
  const supabase = createClient();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [rankingData, setRankingData] = useState<AbiRankingItem[]>([]);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [selectedAbi, setSelectedAbi] = useState<AbiRankingItem | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [photoCount, setPhotoCount] = useState<number>(0);
  const totalPages = Math.max(1, Math.ceil(rankingData.length / pageSize));
  const paginatedRanking = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return rankingData.slice(start, start + pageSize);
  }, [rankingData, currentPage, pageSize]);
  useEffect(() => {
    if (!isLoading && profile?.app_role !== "admin") {
      router.push("/login");
    }
  }, [isLoading, profile, router]);
  useEffect(() => {
    if (profile?.app_role !== "admin") return;
    async function fetchRankingData() {
      setIsDataLoading(true);
      try {
        const [missionsRes, profilesRes, responsesRes, photoCountRes] =
          await Promise.all([
            supabase
              .from("missions")
              .select(
                "id, title, subtitle, week_number, is_active, unlock_date",
              )
              .order("week_number"),
            supabase.from("profiles").select("id, abi, points"),
            supabase
              .from("user_responses")
              .select("user_id, mission_id, profiles(abi)"),
            supabase
              .from("user_responses")
              .select("id, missions!inner(week_number)", {
                count: "exact",
                head: true,
              })
              .eq("missions.week_number", 2)
              .not("selected_option", "is", null),
          ]);
        setMissions(missionsRes.data || []);
        setPhotoCount(photoCountRes.count || 0);
        const profiles = (profilesRes.data || []) as ProfileRow[];
        const responses = (responsesRes.data ||
          []) as unknown as UserResponseRow[];
        const abiMap: Record<string, AbiStats> = {};
        const getOrCreateAbi = (key: string): AbiStats => {
          if (!abiMap[key]) {
            abiMap[key] = {
              participantsSet: new Set(),
              completedMissionsSet: new Set(),
              pointsSum: 0,
            };
          }
          return abiMap[key];
        };
        profiles.forEach((p) => {
          if (!p.abi) return;
          const abiEntry = getOrCreateAbi(p.abi.trim());
          abiEntry.participantsSet.add(p.id);
          abiEntry.pointsSum += p.points ?? 0;
        });
        responses.forEach((res) => {
          const abiKey = res.profiles?.abi?.trim();
          if (!abiKey) return;
          const abiEntry = getOrCreateAbi(abiKey);
          abiEntry.completedMissionsSet.add(`${res.user_id}-${res.mission_id}`);
        });
        const computedRanking: AbiRankingItem[] = Object.entries(abiMap)
          .map(([abi, data]) => ({
            abi,
            participants: data.participantsSet.size,
            completedMissions: data.completedMissionsSet.size,
            points: data.pointsSum,
          }))
          .sort(
            (a, b) => b.points - a.points || b.participants - a.participants,
          );
        setRankingData(computedRanking);
        setSelectedAbi(computedRanking[0] || null);
      } catch (err) {
        console.error("Error al obtener datos de ranking:", err);
      } finally {
        setIsDataLoading(false);
      }
    }
    fetchRankingData();
  }, [profile, supabase]);
  const { totalParticipants, totalMissionsCompleted } = useMemo(() => {
    return rankingData.reduce(
      (acc, curr) => ({
        totalParticipants: acc.totalParticipants + curr.participants,
        totalMissionsCompleted:
          acc.totalMissionsCompleted + curr.completedMissions,
      }),
      { totalParticipants: 0, totalMissionsCompleted: 0 },
    );
  }, [rankingData]);
  const statsData = useMemo<StatItem[]>(
    () => [
      {
        id: "top-abi",
        title: "Abi destacada",
        value: rankingData[0]?.abi ?? "N/A",
        icon: Star,
        iconColor: "text-amber-500",
        bgColor: "bg-amber-100/70",
      },
      {
        id: "participants",
        title: "Participantes",
        value: totalParticipants.toLocaleString("es-CO"),
        icon: Users,
        iconColor: "text-rose-500",
        bgColor: "bg-rose-100/70",
      },
      {
        id: "missions",
        title: "Misiones completadas",
        value: totalMissionsCompleted.toLocaleString("es-CO"),
        icon: Award,
        iconColor: "text-sky-500",
        bgColor: "bg-sky-100/70",
      },
      {
        id: "photos",
        title: "Fotografías compartidas",
        value: photoCount.toLocaleString("es-CO"),
        icon: Camera,
        iconColor: "text-emerald-600",
        bgColor: "bg-emerald-100/70",
      },
    ],
    [rankingData, totalParticipants, totalMissionsCompleted, photoCount],
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
      <AdminHeader missions={missions} />
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          Ranking <span className="text-amber-500">por Abi</span>
        </h2>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Ranking de exalumnos por generación.
        </p>
      </div>
      <Stats items={statsData} loading={isDataLoading} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {isDataLoading ? (
          <Card className="lg:col-span-2 rounded-2xl border-none shadow-sm">
            <CardHeader className="border-b border-slate-100/80 pb-4">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4"
                >
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card className="lg:col-span-2 rounded-2xl border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Ranking de Generaciones
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 font-medium mt-1">
                    Mostrando {paginatedRanking.length} de{" "}
                    <span className="font-bold text-slate-700">
                      {rankingData.length}
                    </span>
                  </CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-amber-50 text-amber-700 border-amber-200"
                >
                  {rankingData.length} generaciones
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/60">
                  <TableRow className="border-b border-slate-100 hover:bg-transparent">
                    <TableHead className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Posición
                    </TableHead>
                    <TableHead className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Abi
                    </TableHead>
                    <TableHead className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                      Participantes
                    </TableHead>
                    <TableHead className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                      Misiones
                    </TableHead>
                    <TableHead className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                      Puntos
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100 font-medium">
                  {paginatedRanking.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-36 text-center text-slate-400 font-medium"
                      >
                        No hay datos de ranking disponibles.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRanking.map((item, index) => {
                      const absoluteIndex =
                        (currentPage - 1) * pageSize + index;
                      const isSelected = selectedAbi?.abi === item.abi;
                      return (
                        <TableRow
                          key={item.abi}
                          onClick={() => setSelectedAbi(item)}
                          className={`cursor-pointer transition-colors hover:bg-slate-50/80 ${isSelected ? "bg-amber-50/50" : ""}`}
                        >
                          <TableCell className="px-6 py-4 font-bold text-slate-900">
                            {absoluteIndex < 3 ? (
                              <span
                                className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-extrabold text-xs shadow-2xs ${
                                  absoluteIndex === 0
                                    ? "bg-amber-100 text-amber-700"
                                    : absoluteIndex === 1
                                      ? "bg-slate-200 text-slate-700"
                                      : "bg-amber-700/20 text-amber-900"
                                }`}
                              >
                                {absoluteIndex + 1}
                              </span>
                            ) : (
                              <span className="pl-2">{absoluteIndex + 1}</span>
                            )}
                          </TableCell>
                          <TableCell className="px-6 py-4 font-bold text-slate-900">
                            {item.abi}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-center font-semibold text-slate-600">
                            {item.participants}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-center font-semibold text-slate-600">
                            {item.completedMissions}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right font-extrabold text-amber-600">
                            {item.points.toLocaleString("es-CO")}
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
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
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
        )}
        {selectedAbi &&
          (() => {
            const percentage = Math.min(
              Math.round(
                (selectedAbi.participants / (totalParticipants || 1)) * 100,
              ),
              100,
            );
            return (
              <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white p-6 space-y-6">
                <CardHeader className="p-0">
                  <CardTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2.5">
                    <div className="p-2 bg-amber-100/70 text-amber-600 rounded-xl">
                      <Trophy className="w-5 h-5" />
                    </div>
                    Abi {selectedAbi.abi}
                  </CardTitle>
                </CardHeader>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <span>Participantes activos</span>
                    <span className="text-slate-900 font-extrabold text-sm">
                      {selectedAbi.participants}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-[11px] font-medium text-slate-400 text-right">
                    {percentage}% del total general
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Misiones completadas:</span>
                    <span className="font-bold text-slate-900">
                      {selectedAbi.completedMissions}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Puntaje acumulado:</span>
                    <span className="font-bold text-amber-600">
                      {selectedAbi.points.toLocaleString("es-CO")} pts
                    </span>
                  </div>
                </div>
              </Card>
            );
          })()}
      </div>
    </div>
  );
}
