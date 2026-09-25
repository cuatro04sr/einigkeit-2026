"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MascotCallout } from "@/components/shared/mascot-callout";
import { createClient } from "@/lib/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";

const supabase = createClient();

type AttendanceStatus = "yes" | "no" | null;

export default function AsistenciaPage() {
  const { user } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [status, setStatus] = useState<AttendanceStatus>(null);
  const [submitting, setSubmitting] = useState(false);

  // 1. Precarga los datos del formulario desde el perfil del usuario
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        // Ajusta los nombres de columna al esquema real de tu tabla "profiles"
        const { data, error } = await supabase
          .from("profiles")
          .select("first_name, last_name, abi, whatsapp")
          .eq("id", user.id)
          .single();
        if (error) throw error;

        setFullName(
          [data?.first_name, data?.last_name].filter(Boolean).join(" "),
        );
        setGraduationYear(data?.abi?.toString() || "");
        setPhone(data?.whatsapp || "");
        setEmail(user.email || "");
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo cargar tu información";
        console.log("Error fetching profile:", error);
        toast.error("Ocurrió un error", { description: message });
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [user]);

  // 2. Envía la confirmación de asistencia
  const handleRSVP = async (attending: boolean) => {
    if (!user) return;
    try {
      setSubmitting(true);
      // Ajusta "event_rsvps" y las columnas a tu tabla real
      const { error } = await supabase.from("event_rsvps").upsert(
        {
          user_id: user.id,
          event_slug: "reencuentro-3-octubre",
          full_name: fullName,
          abi: graduationYear,
          email,
          phone,
          attending,
        },
        { onConflict: "user_id" },
      );
      console.log(error);
      if (error) throw error;

      setStatus(attending ? "yes" : "no");
      toast.success(
        attending
          ? "¡Gracias por confirmar! Te esperamos el 3 de octubre."
          : "Registramos tu respuesta. ¡Esperamos verte en la próxima!",
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo enviar tu respuesta";
      toast.error("Ocurrió un error", { description: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative w-full max-w-7xl mx-auto py-2 sm:px-2 lg:px-4 overflow-hidden">
      {/* Encabezado: reemplaza por tus imágenes reales de ASODECA / Einigkeit */}
      <header className="flex items-center gap-6 mb-10">
        <img
          src="/logos/asodeca-logo.png"
          alt="ASODECA"
          className="h-12 w-auto"
        />
        <div className="h-8 w-px bg-slate-200" />
        <img
          src="/logos/einigkeit-logo.png"
          alt="Einigkeit 2026"
          className="h-8 w-auto"
        />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 items-start relative gap-2 z-10">
        {/* Columna izquierda */}
        <div className="space-y-6">
          <Badge className="bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-xs font-bold w-fit">
            Caso de uso 07 • Evento
          </Badge>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 leading-tight">
              ¿Nos acompañas el{" "}
              <span className="text-red-600">Sábado 3 de octubre?</span>
            </h1>
            <p className="text-lg font-semibold text-slate-900 pt-2">
              Confirma tu asistencia.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2 w-fit max-w-md">
            <p className="font-bold text-slate-950 border-b border-slate-100 pb-2 mb-1">
              Aula máxima Colegio Alemán Cali
            </p>
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">
                2:30 p.m. – 3:30 p.m.:
              </span>{" "}
              Quiquenios.
            </p>
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">
                3:30 p.m. – 4:30 p.m.:
              </span>{" "}
              Cierre del juego interactivo.
            </p>
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">
                4:30 p.m. en adelante:
              </span>{" "}
              Reencuentro de egresados.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:col-span-2 items-end justify-center gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 w-full max-w-md lg:ml-auto">
            <h2 className="text-lg font-bold text-slate-950">
              Confirma tus datos
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Nombre completo"
                value={fullName}
                onChange={setFullName}
                disabled={loadingProfile}
                className="col-span-2 sm:col-span-1"
              />
              <FormField
                label="Año de egreso"
                value={graduationYear}
                onChange={setGraduationYear}
                disabled={loadingProfile}
                className="col-span-2 sm:col-span-1"
              />
              <FormField
                label="Correo electrónico"
                value={email}
                onChange={setEmail}
                disabled={loadingProfile}
                className="col-span-2 sm:col-span-1"
              />
              <FormField
                label="Celular"
                value={phone}
                onChange={setPhone}
                disabled={loadingProfile}
                className="col-span-2 sm:col-span-1"
              />
            </div>

            <p className="text-center font-semibold text-slate-900 text-sm">
              ¿Asistirás al encuentro?
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleRSVP(true)}
                disabled={submitting || loadingProfile}
                className="w-full flex items-center justify-between gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold rounded-xl px-5 py-3 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Sí, asistiré
                </span>
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => handleRSVP(false)}
                disabled={submitting || loadingProfile}
                className="w-full flex items-center justify-between gap-2 bg-white hover:bg-slate-50 disabled:opacity-60 text-slate-900 font-semibold rounded-xl px-5 py-3 border border-slate-300 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Circle className="w-5 h-5 text-slate-400" />
                  No, no podré asistir
                </span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {status && (
              <p className="text-center text-sm font-medium text-slate-500">
                {status === "yes"
                  ? "Confirmaste tu asistencia ✅"
                  : "Registramos que no podrás asistir"}
              </p>
            )}
          </div>
          <div className="justify-center items-center hidden lg:flex">
            <MascotCallout
              imageSrc="/mascot/otto-hero-auth.png"
              message="Tu respuesta nos ayuda a crear un reencuentro inolvidable para todos."
              orientation="vertical"
              className="!w-[200px] [&>div:first-child]:!text-xs [&>div:first-child]:!-translate-y-5 [&>div:first-child]:!translate-x-2 [&>div:last-child]:!w-[200px] [&>div:last-child]:!h-[200px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FormField({
  label,
  value,
  onChange,
  disabled,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs text-slate-500 font-medium">{label}</label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="border-0 border-b border-slate-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-slate-900 font-semibold text-slate-900"
      />
    </div>
  );
}
