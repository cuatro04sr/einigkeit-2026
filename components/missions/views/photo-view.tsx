"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import Link from "next/link";
import {
  Image as ImageIcon,
  ArrowRight,
  ArrowLeft,
  Upload,
  Check,
  Save,
} from "lucide-react";

import { MascotCallout } from "@/components/shared/mascot-callout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/client";
import { PhotoViewProps } from "@/types";
import { cn } from "@/lib/utils";

const supabase = createClient();

export function PhotoView({ mission, question }: PhotoViewProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [storyText, setStoryText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
      }
    },
    [],
  );
  const handleFinalSubmit = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para guardar tu recuerdo");
      return;
    }
    if (!file) {
      toast.error("Por favor selecciona una foto");
      return;
    }
    if (!storyText.trim()) {
      toast.error("Por favor cuéntanos la historia detrás de la foto");
      return;
    }
    try {
      setSubmitting(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `mission-2/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from("missions")
        .upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage
        .from("missions")
        .getPublicUrl(filePath);
      const { error: dbError } = await supabase.from("user_responses").upsert(
        {
          user_id: user.id,
          mission_id: mission.id,
          question_id: question?.id || null,
          selected_option: publicUrlData.publicUrl,
          text_answer: storyText.trim(),
          is_correct: true,
          status: "pending",
          points_earned: 10,
        },
        { onConflict: "user_id,question_id" },
      );
      if (dbError) throw dbError;
      toast.success("¡Recuerdo guardado con éxito!");
      setIsCompleted(true);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al guardar";
      toast.error("Error al completar la misión", { description: message });
    } finally {
      setSubmitting(false);
    }
  };
  const isFormValid = useMemo(
    () => Boolean(file && storyText.trim()),
    [file, storyText],
  );
  const mascotImageSrc = file
    ? "/mascot/otto-after-upload.png"
    : "/mascot/otto-upload.png";
  const mascotMessage = file ? (
    <>
      ¡Cuentanos <span className="text-red-600 block">tu historia!</span>
    </>
  ) : (
    <>
      ¡Sube <span className="text-red-600 block">tu foto!</span>
    </>
  );
  const mascotClassName = file
    ? "!w-[320px] [&>div:last-child]:!w-[190px] [&>div:first-child]:!translate-x-8 [&>div:last-child]:!h-[340px] [&_img]:!object-cover"
    : "!max-w-[320px] [&>div:last-child]:!w-[320px] [&>div:first-child]:!translate-x-8 [&>div:first-child]:!translate-y-12 [&>div:last-child]:!h-[360px] [&_img]:!object-cover";
  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-between !p-0 relative overflow-hidden">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Misión {mission.week_number}: Completada
          </h1>
        </div>
        <div className="relative w-full max-w-2xl aspect-video">
          <Image
            src="/backgrounds/mission/wall-mission-2.png"
            alt="Muro con apertura"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="w-full flex items-center justify-between max-w-6xl">
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-600 text-center max-w-xl leading-snug px-4">
            El muro continúa cayendo. Regresa el próximo viernes.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-2xl px-6 py-3 shadow-md hover:shadow-lg transition-all flex items-center gap-2 shrink-0"
          >
            <span>Continuar</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="absolute inset-0 -z-10 pointer-events-none bg-cover bg-center bg-no-repeat bg-[url('/bg-mobile-white.png')] lg:bg-[size:100%_100%] lg:bg-[url('/backgrounds/mission/bg-mission-2.png')]" />
      <div className="flex flex-col w-full mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-2 w-full">
          <div className="flex flex-col justify-between w-full gap-5">
            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="destructive"
                size="icon"
                className="w-8 h-8 rounded-xl bg-red-600 hover:bg-red-700 shrink-0"
              >
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 text-white" />
                </Link>
              </Button>
              <div className="flex items-center gap-2 text-sm font-bold">
                <span className="text-blue-600">
                  Misión {mission.week_number}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-400 font-normal">
                  {mission.subtitle || "Verlorene Akte"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Recordemos juntos
                </h1>
                <p className="text-sm text-slate-500">
                  {question?.question_text ||
                    "Sube una foto de tu época escolar y cuéntanos la historia detrás de ella ."}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
              <Card
                onClick={() => fileInputRef.current?.click()}
                className="group relative cursor-pointer border border-slate-200 bg-white hover:border-blue-300 transition-all rounded-2xl shadow-none p-5 flex flex-col justify-between min-h-[260px]"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/jpg"
                  className="hidden"
                />
                <h3 className="text-base font-bold text-slate-900">
                  Sube tu foto
                </h3>
                <div className="w-full flex-1 my-3 border-2 border-dashed border-blue-200 group-hover:border-blue-400 bg-blue-50/80 group-hover:bg-blue-50 transition-colors rounded-xl flex flex-col items-center justify-center text-center p-4">
                  <div className="text-blue-600 mb-2 group-hover:scale-105 transition-transform">
                    <Upload className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900 leading-snug mb-1">
                    Arrastra tu foto aquí o haz clic para buscar en el
                    dispositivo
                  </p>
                  <p className="text-xs text-slate-400">
                    Selecciona archivos .jpeg .png
                  </p>
                </div>
                {file && (
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white p-1 rounded-full shadow-sm">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </Card>
              {previewUrl ? (
                <>
                  <Card className="border border-slate-200 rounded-2xl shadow-none p-4 flex flex-col justify-between bg-white min-h-[260px]">
                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      Vista previa
                    </h3>
                    <div className="relative w-full flex-1 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center min-h-[180px]">
                      <Image
                        src={previewUrl}
                        alt="Vista previa"
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  </Card>
                  <Card className="border border-slate-200 rounded-2xl shadow-none p-4 flex flex-col justify-between bg-white min-h-[260px] lg:col-span-1">
                    <div className="flex flex-col gap-2 h-full">
                      <label className="text-sm font-bold text-slate-800">
                        Cuéntanos la historia
                      </label>
                      <Textarea
                        value={storyText}
                        onChange={(e) => setStoryText(e.target.value)}
                        placeholder="Escribe aquí la historia de tu foto..."
                        className="w-full flex-1 min-h-[140px] rounded-xl border-slate-200 resize-none"
                      />
                    </div>
                  </Card>
                </>
              ) : (
                <div className="relative w-full min-h-[260px] lg:col-span-2 rounded-2xl overflow-hidden">
                  <Image
                    src="/upload-photo-college.png"
                    alt="Ejemplo"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          </div>
          <MascotCallout
            imageSrc={mascotImageSrc}
            message={mascotMessage}
            orientation="vertical"
            className={mascotClassName}
          />
        </div>
        <Card className="w-full bg-[#FFFDF9] border-slate-200/80 rounded-2xl shadow-none py-0 mt-2">
          <CardContent className="flex items-center justify-between p-3 sm:p-4">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-red-300 text-red-600 shadow-none"
            >
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" /> Salir
              </Link>
            </Button>
            <Button
              onClick={handleFinalSubmit}
              size="lg"
              disabled={!isFormValid || submitting}
              className={cn(
                "rounded-xl shadow-none transition-colors",
                isFormValid
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed hover:bg-slate-200",
              )}
            >
              {submitting ? "Guardando..." : "Guardar recuerdo"}{" "}
              <Save className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
