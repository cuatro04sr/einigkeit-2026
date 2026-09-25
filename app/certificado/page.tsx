"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Share2, ShieldCheck } from "lucide-react";

const supabase = createClient();

// Resolución alta para que el PNG exportado se vea nítido
const CERTIFICATE_WIDTH = 1500;
const CERTIFICATE_HEIGHT = 2250;

// Coordenada del centro donde cae el nombre (ajústala a tu plantilla real)
const NAME_POSITION = { x: CERTIFICATE_WIDTH / 2, y: 1000 };

export default function CertificadoPage() {
  const { user } = useAuthStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fullName, setFullName] = useState<string>("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [generating, setGenerating] = useState(false);

  // 1. Trae el nombre del usuario desde Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", user.id)
          .single();
        if (error) throw error;
        const name = [data?.first_name, data?.last_name]
          .filter(Boolean)
          .join(" ");
        setFullName(name || "Participante");
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo cargar tu información";
        toast.error("Ocurrió un error", { description: message });
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [user]);

  const drawCertificate = (name: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const image = new Image();
    image.src = "/certificado-base.png";

    image.onload = () => {
      canvas.width = CERTIFICATE_WIDTH;
      canvas.height = CERTIFICATE_HEIGHT;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#1e293b";
      ctx.font = "italic 70px 'Playfair Display', 'Georgia', serif";

      ctx.fillText(name, NAME_POSITION.x, NAME_POSITION.y);
    };

    image.onerror = () => {
      toast.error("No se pudo cargar la plantilla del certificado");
    };
  };

  // 2. Dibuja el certificado cuando ya tenemos el nombre
  useEffect(() => {
    if (loadingProfile) return;
    drawCertificate(fullName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingProfile, fullName]);

  // 3. Exporta y descarga el PNG final en alta calidad
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      setGenerating(true);
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `certificado-einigkeit-2026-${fullName
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase()}.png`;
      link.click();
    } catch {
      toast.error("No se pudo generar el certificado");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <section className="relative w-full mx-auto pt-4 px-2 sm:px-4 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
        {/* Columna izquierda: texto, stats, acciones, mascota */}
        <div className="space-y-2 order-2 lg:order-1">
          <Badge className="h-6 bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-xs font-bold w-fit">
            <span className="text-red-500">Caso de uso 09</span>{" "}
            <span className="text-gray-800 text-light">• Misión cumplida</span>
          </Badge>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 leading-tight">
            ¡Haz completado
            <span className="text-yellow-400 block">las 8 misiones!</span>
          </h1>

          <p className="text-slate-600 text-base sm:text-md leading-relaxed">
            Gracias por{" "}
            <span className="font-semibold text-slate-900">
              unir generaciones
            </span>{" "}
            y construir{" "}
            <span className="font-semibold text-slate-900">un legado</span> que
            nos trascienda. Tu participación hace parte de esta historia que
            seguimos escribiendo juntos.
          </p>

          <div className="flex items-center justify-center gap-8 bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm w-full">
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-15 h-15 text-orange-500" />
            </div>
            <div>
              <p className="font-extrabold text-3xl text-slate-950 leading-none">
                8/8
              </p>
              <p className="text-sm text-slate-500 font-medium">
                misiones completadas
              </p>
              <p className="text-xs text-orange-500 font-semibold">
                ¡Misión cumplida al 100%!
              </p>
            </div>
          </div>

          {/* Botones responsivos mejorados */}
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button
              onClick={handleDownload}
              disabled={loadingProfile || generating}
              className="gap-2 bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-2 text-xs sm:text-sm font-medium w-full sm:w-auto"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {generating ? "Generando..." : "Descargar certificado"}
              </span>
            </Button>
            <Button
              variant="outline"
              className="gap-2 rounded-xl px-4 py-2 border-slate-300 text-slate-700 text-xs sm:text-sm font-medium w-full sm:w-auto"
            >
              <Share2 className="w-4 h-4 shrink-0" />
              <span className="truncate">Compartir mi logro</span>
            </Button>
          </div>

          {/* Mascota + globo de texto */}
          <div className="flex items-end gap-3">
            <img
              src="/mascot/otto-mitad.png"
              alt="Otto, la mascota de ASODECA"
              className="w-24 sm:w-28 h-auto object-contain shrink-0"
            />
            <div className="bg-white mb-4 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm max-w-[230px]">
              <p className="font-bold text-slate-950 text-sm">¡Lo lograste!</p>
              <p className="text-slate-600 text-sm font-light leading-snug">
                Descarga tu certificado y sigue construyendo historias que
                inspiran.
              </p>
            </div>
          </div>
        </div>

        {/* Columna derecha: foto decorativa + certificado superpuesto */}
        <div className="relative col-span-2 order-1 lg:order-2 w-full">
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-2xl overflow-hidden">
            <img
              src="/certificado/hero-bg.png"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              className="absolute right-[3%] sm:right-[5%] top-1/2 -translate-y-1/2 w-[38%] sm:w-[36%] max-w-[260px] h-auto rounded-lg shadow-2xl rotate-2 border-4 border-white"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
