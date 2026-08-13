"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileLocationData, StatItem, Mission } from "@/types";
import { AdminHeader } from "@/components/admin/header";
import { useAuthStore } from "@/store/useAuthStore";
import { Stats } from "@/components/admin/stats";
import { createClient } from "@/lib/client";
import {
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
  Select,
} from "@/components/ui/select";

import { useEffect, useMemo, useState } from "react";
import { Country } from "country-state-city";
import { useRouter } from "next/navigation";
import "flag-icons/css/flag-icons.min.css";
import {
  ZoomableGroup,
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import {
  Building2,
  Loader2,
  ZoomOut,
  ZoomIn,
  MapPin,
  Plane,
  Users,
  Globe,
} from "lucide-react";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function FlagIcon({
  isoCode,
  className = "w-5 h-3.5",
}: {
  isoCode?: string;
  className?: string;
}) {
  if (!isoCode) return <Globe className="w-4 h-4 text-slate-400" />;
  return (
    <span
      className={`fi fi-${isoCode.toLowerCase()} rounded-[2px] shadow-sm flex-shrink-0 ${className}`}
    />
  );
}

export default function WorldMapAdminPage() {
  const router = useRouter();
  const { profile, isLoading } = useAuthStore();
  const supabase = createClient();
  const [profilesCount, setProfilesCount] = useState<number>(0);
  const [locations, setLocations] = useState<ProfileLocationData[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [selectedCountry, setSelectedCountry] = useState<string>("Colombia");
  const [zoom, setZoom] = useState<number>(1);
  const [tooltip, setTooltip] = useState<{
    content: string;
    count: number;
    isoCode?: string;
    x: number;
    y: number;
  } | null>(null);
  const getIsoByCountryName = (name: string): string | undefined => {
    if (!name) return undefined;
    const clean = name.trim();
    if (clean.length === 2) return clean.toUpperCase();
    if (clean.toLowerCase() === "united states of america") return "US";
    return Country.getAllCountries().find(
      (c) => c.name.toLowerCase() === clean.toLowerCase(),
    )?.isoCode;
  };
  useEffect(() => {
    if (!isLoading && profile?.app_role !== "admin") router.push("/login");
  }, [isLoading, profile, router]);
  useEffect(() => {
    if (profile?.app_role !== "admin") return;
    async function fetchData() {
      setIsDataLoading(true);
      const [pRes, lRes, mRes] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("country, state, city, abi"),
        supabase
          .from("missions")
          .select("id, title, subtitle, week_number, is_active, unlock_date")
          .order("week_number"),
      ]);
      setProfilesCount(pRes.count ?? 0);
      setLocations(lRes.data || []);
      setMissions(mRes.data || []);
      setIsDataLoading(false);
    }
    fetchData();
  }, [profile, supabase]);
  const countryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    locations.forEach(({ country }) => {
      if (!country) return;
      let c = country.trim();
      if (c.toLowerCase() === "united states") c = "United States of America";
      stats[c] = (stats[c] || 0) + 1;
    });
    return stats;
  }, [locations]);
  const statsData = useMemo<StatItem[]>(
    () => [
      {
        id: "countries",
        title: "Países conectados",
        value: Object.keys(countryStats).length.toLocaleString("es-CO"),
        icon: Plane,
        iconColor: "text-amber-500",
        bgColor: "bg-amber-100/70",
      },
      {
        id: "cities",
        title: "Ciudades / Departamentos",
        value: new Set(
          locations
            .map((l) => l.city?.trim() || l.state?.trim())
            .filter(Boolean),
        ).size.toLocaleString("es-CO"),
        icon: Building2,
        iconColor: "text-emerald-600",
        bgColor: "bg-emerald-100/70",
      },
      {
        id: "profiles",
        title: "Exalumnos registrados",
        value: profilesCount.toLocaleString("es-CO"),
        icon: Users,
        iconColor: "text-sky-500",
        bgColor: "bg-sky-100/70",
      },
    ],
    [countryStats, locations, profilesCount],
  );
  const availableCountries = useMemo(() => {
    const keys = Object.keys(countryStats).sort();
    return keys.length ? keys : ["Colombia"];
  }, [countryStats]);
  const activeCountry = availableCountries.includes(selectedCountry)
    ? selectedCountry
    : availableCountries[0];
  const citiesForSelectedCountry = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    locations.forEach(({ country, city, state, abi }) => {
      let c = country?.trim();
      if (c?.toLowerCase() === "united states") c = "United States of America";
      if (c?.toLowerCase() !== activeCountry.toLowerCase()) return;
      const name = city?.trim() || state?.trim();
      if (name) {
        if (!map[name]) map[name] = new Set();
        if (abi?.trim()) map[name].add(abi.trim());
      }
    });
    return Object.entries(map)
      .map(([name, abiSet]) => ({ name, abiCount: abiSet.size }))
      .sort((a, b) => b.abiCount - a.abiCount);
  }, [locations, activeCountry]);
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
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Mapa <span className="text-amber-500">Mundial</span>
        </h2>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Alcance geográfico de la comunidad ASODECA.
        </p>
      </div>
      <Stats items={statsData} loading={isDataLoading} />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <Card className="lg:col-span-3 rounded-2xl border border-slate-800 shadow-2xl bg-slate-950 overflow-hidden p-2 relative min-h-[500px] flex items-center justify-center">
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.5, 6))}
              className="p-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-700/80 backdrop-blur shadow-lg transition-all"
              title="Acercar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.5, 1))}
              className="p-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-700/80 backdrop-blur shadow-lg transition-all"
              title="Alejar"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
          {tooltip && (
            <div
              className="pointer-events-none fixed z-50 transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-2 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-md text-white text-xs flex items-center gap-2.5"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              <FlagIcon isoCode={tooltip.isoCode} />
              <div>
                <p className="font-bold">{tooltip.content}</p>
                <p className="text-[11px] text-amber-400">
                  {tooltip.count} {tooltip.count === 1 ? "usuario" : "usuarios"}
                </p>
              </div>
            </div>
          )}
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 135, center: [0, 20] }}
            className="w-full h-full max-h-[520px]"
          >
            <ZoomableGroup zoom={zoom} center={[0, 20]}>
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    let name = geo.properties.name;
                    if (name.toLowerCase() === "united states")
                      name = "United States of America";
                    const count = countryStats[name] || 0;
                    const active = count > 0;
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={(e) =>
                          setTooltip({
                            content: name,
                            count,
                            isoCode: getIsoByCountryName(name),
                            x: e.clientX,
                            y: e.clientY,
                          })
                        }
                        onMouseMove={(e) =>
                          setTooltip((prev) =>
                            prev
                              ? { ...prev, x: e.clientX, y: e.clientY }
                              : null,
                          )
                        }
                        onMouseLeave={() => setTooltip(null)}
                        onClick={() => active && setSelectedCountry(name)}
                        style={{
                          default: {
                            fill: active ? "#f59e0b" : "#1e293b",
                            stroke: active ? "#fbbf24" : "#334155",
                            strokeWidth: 0.5,
                            outline: "none",
                          },
                          hover: {
                            fill: active ? "#fbbf24" : "#334155",
                            cursor: active ? "pointer" : "default",
                            outline: "none",
                          },
                          pressed: { fill: "#d97706", outline: "none" },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </Card>
        <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white p-5 space-y-5">
          <CardHeader className="p-0 pb-1">
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span>Detalle geográfico</span>
              <FlagIcon isoCode={getIsoByCountryName(activeCountry)} />
            </CardTitle>
          </CardHeader>
          <Select value={activeCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-full bg-slate-50 border-slate-200 text-xs font-semibold focus:ring-amber-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableCountries.map((c) => (
                <SelectItem key={c} value={c}>
                  <div className="flex items-center gap-2.5">
                    <FlagIcon isoCode={getIsoByCountryName(c)} />
                    <span className="text-xs font-medium">{c}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {citiesForSelectedCountry.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No hay zonas registradas.
              </p>
            ) : (
              citiesForSelectedCountry.map((city, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all border border-slate-100/80 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {city.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                    {city.abiCount} {city.abiCount === 1 ? "ABI" : "ABIs"}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
