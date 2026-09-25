"use client";

import { Stats } from "@/components/admin/stats";
import { StatItem } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";
import { createClient } from "@/lib/client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  CheckCircle2,
  XCircle,
  Users,
  BadgeCheck,
  Search,
  Download,
  Mail,
  Phone,
  MapPin,
  QrCode,
  Loader2,
} from "lucide-react";

type AttendanceStatus = boolean | null;

type RsvpRow = {
  id: string;
  user_id: string;
  full_name: string;
  abi: string | number | null;
  email: string;
  phone: string | null;
  attending: AttendanceStatus;
  // Vienen del join con "profiles" — ajusta los nombres de columna a tu esquema real
  city: string | null;
  country: string | null;
};

const supabase = createClient();

export default function ConfirmacionesPage() {
  const router = useRouter();
  const { profile, isLoading } = useAuthStore();

  const [rsvps, setRsvps] = useState<RsvpRow[]>([]);
  const [profilesCount, setProfilesCount] = useState<number>(0);
  const [loadingData, setLoadingData] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && profile?.app_role !== "admin") {
      router.push("/login");
    }
  }, [isLoading, profile, router]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoadingData(true);
        const [rsvpsRes, profilesRes] = await Promise.all([
          supabase
            .from("event_rsvps")
            .select(
              "id, user_id, full_name, abi, email, phone, attending, profiles(city, country)",
            )
            .order("created_at", { ascending: false }),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
        ]);

        if (rsvpsRes.error) throw rsvpsRes.error;
        if (profilesRes.error) throw profilesRes.error;
        const mapped: RsvpRow[] = rsvpsRes.data.map((row) => ({
          id: row.id,
          user_id: row.user_id,
          full_name: row.full_name,
          abi: row.abi,
          email: row.email,
          phone: row.phone,
          attending: row.attending,
          city: row.profiles.city ?? null,
          country: row.profiles.country ?? null,
        }));
        setRsvps(mapped);
        setProfilesCount(profilesRes.count ?? 0);
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las confirmaciones";
        toast.error("Ocurrió un error", { description: message });
      } finally {
        setLoadingData(false);
      }
    }
    if (profile?.app_role === "admin") {
      fetchData();
    }
  }, [profile]);

  // Nota: no tengo forma de saber qué representa exactamente "Confirmadas por
  // Abi" en tu app — asumí que cuenta cuántas generaciones (años de egreso)
  // distintas tienen al menos una confirmación. Ajusta este cálculo si se
  // refiere a otra cosa.
  const confirmedByAbiCount = useMemo(() => {
    const years = new Set(
      rsvps.filter((r) => r.attending === true && r.abi).map((r) => r.abi),
    );
    return years.size;
  }, [rsvps]);

  const statsData = useMemo<StatItem[]>(
    () => [
      {
        id: "confirmed",
        title: "Confirmaciones recibidas",
        value: rsvps
          .filter((r) => r.attending === true)
          .length.toLocaleString("es-CO"),
        icon: CheckCircle2,
        iconColor: "text-emerald-600",
        bgColor: "bg-emerald-100/70",
      },
      {
        id: "confirmed-by-abi",
        title: "Confirmadas por Abi",
        value: confirmedByAbiCount.toLocaleString("es-CO"),
        icon: BadgeCheck,
        iconColor: "text-amber-500",
        bgColor: "bg-amber-100/70",
      },
      {
        id: "total-invited",
        title: "Invitados totales",
        value: profilesCount.toLocaleString("es-CO"),
        icon: Users,
        iconColor: "text-sky-500",
        bgColor: "bg-sky-100/70",
      },
      {
        id: "not-attending",
        title: "No asistirán",
        value: rsvps
          .filter((r) => r.attending === false)
          .length.toLocaleString("es-CO"),
        icon: XCircle,
        iconColor: "text-rose-500",
        bgColor: "bg-rose-100/70",
      },
    ],
    [rsvps, confirmedByAbiCount, profilesCount],
  );

  const filteredRsvps = useMemo(() => {
    return rsvps.filter((r) => {
      const matchesSearch = r.full_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "confirmed" && r.attending === true) ||
        (statusFilter === "pending" && r.attending === null) ||
        (statusFilter === "not-attending" && r.attending === false);
      return matchesSearch && matchesStatus;
    });
  }, [rsvps, searchQuery, statusFilter]);

  const selected = useMemo(
    () => rsvps.find((r) => r.id === selectedId) ?? filteredRsvps[0] ?? null,
    [rsvps, filteredRsvps, selectedId],
  );

  const exportToCSV = (rows: RsvpRow[], filename: string) => {
    const header = [
      "Nombre",
      "Abi",
      "Ciudad",
      "País",
      "Correo",
      "Celular",
      "Estado",
    ];
    const lines = rows.map((r) => [
      r.full_name,
      r.abi ?? "",
      r.city ?? "",
      r.country ?? "",
      r.email,
      r.phone ?? "",
      statusLabel(r.attending),
    ]);
    const csv = [header, ...lines]
      .map((line) =>
        line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading || profile?.app_role !== "admin") {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-2 max-w-[1400px] mx-auto">
      {/* Encabezado propio para esta vista — no reutiliza AdminHeader porque
          sus filtros están pensados para misiones, no para confirmaciones */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-extrabold text-xl">
          EINIGKEIT <span className="text-red-600">2026</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar exalumno..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-56"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="not-attending">No asistirá</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() =>
              exportToCSV(filteredRsvps, "confirmaciones-einigkeit-2026.csv")
            }
          >
            <Download className="w-4 h-4" />
            Exportar reporte
          </Button>
        </div>
      </header>

      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Confir<span className="text-amber-400">maciones</span>
        </h2>
        <p className="text-sm font-medium mt-1 text-slate-500">
          Asistencia al gran encuentro.
        </p>
      </div>

      <Stats items={statsData} loading={loadingData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Tabla de confirmaciones */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Abi</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRsvps.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => setSelectedId(row.id)}
                  className={`cursor-pointer ${
                    selected?.id === row.id ? "bg-slate-50" : ""
                  }`}
                >
                  <TableCell className="flex items-center gap-2 py-3">
                    <Avatar name={row.full_name} />
                    <span className="font-medium text-slate-900">
                      {row.full_name}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {row.abi ?? "—"}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {row.city ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge attending={row.attending} />
                  </TableCell>
                </TableRow>
              ))}
              {!loadingData && filteredRsvps.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-slate-400 py-8"
                  >
                    No hay confirmaciones que coincidan con el filtro.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Panel de detalle */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <p className="font-bold text-slate-950">Detalle</p>

          {selected ? (
            <>
              <div className="flex items-center gap-3">
                <Avatar name={selected.full_name} size="lg" />
                <div>
                  <p className="font-semibold text-slate-950">
                    {selected.full_name}
                  </p>
                  <p className="text-sm text-slate-500">
                    Abi {selected.abi ?? "—"}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {selected.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {selected.phone ?? "—"}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {[selected.city, selected.country]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
              </div>

              <Button
                className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white"
                onClick={() =>
                  exportToCSV([selected], `${selected.full_name}.csv`)
                }
              >
                <Download className="w-4 h-4" />
                Exportar Registro
              </Button>
            </>
          ) : (
            <p className="text-sm text-slate-400">
              Selecciona una fila de la tabla para ver el detalle.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ attending }: { attending: AttendanceStatus }) {
  if (attending === true) {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full font-semibold">
        Confirmado
      </Badge>
    );
  }
  if (attending === false) {
    return (
      <Badge className="bg-rose-100 text-rose-700 border border-rose-200 rounded-full font-semibold">
        No asistirá
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-100 text-amber-700 border border-amber-200 rounded-full font-semibold">
      Pendiente
    </Badge>
  );
}

function statusLabel(attending: AttendanceStatus) {
  if (attending === true) return "Confirmado";
  if (attending === false) return "No asistirá";
  return "Pendiente";
}

const AVATAR_COLORS = [
  "bg-purple-500",
  "bg-blue-500",
  "bg-rose-500",
  "bg-orange-500",
  "bg-emerald-500",
];

function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "lg" }) {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? "?";
  const colorIndex = (name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length;
  const dimension = size === "lg" ? "w-10 h-10 text-base" : "w-7 h-7 text-xs";
  return (
    <div
      className={`${dimension} ${AVATAR_COLORS[colorIndex]} rounded-full flex items-center justify-center text-white font-bold shrink-0`}
    >
      {initial}
    </div>
  );
}
