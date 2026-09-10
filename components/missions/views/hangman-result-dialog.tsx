import { MascotDialog } from "@/components/shared/mascot-dialog";
import { HangmanResultDialogProps } from "@/types";
import { Button } from "@/components/ui/button";

import { RotateCcw, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

export function HangmanResultDialog({
  open,
  onOpenChange,
  isSuccess,
  onRetry,
  onContinue,
  submitting = false,
}: HangmanResultDialogProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (!audioRef.current)
      audioRef.current = new Audio("/missions/m6/du-hast.mp3");
    if (open) {
      audioRef.current
        .play()
        .catch((e) => console.log("Audio autoplay prevented", e));
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [open]);
  const imageSrc = isSuccess
    ? "/mascot/otto-happy.png"
    : "/mascot/otto-hangman-sad.png";
  const title = isSuccess ? "¡Muy bien!" : "¡Casi lo consigues!";
  return (
    <MascotDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      imageSrc={imageSrc}
      imageAlt={title}
    >
      <div className="flex flex-col h-full justify-center gap-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-red-600 tracking-tight leading-none">
          {title}
        </h2>
        {isSuccess ? (
          <div className="flex flex-col gap-4">
            <p className="text-xs sm:text-sm leading-relaxed max-w-md font-medium text-slate-800">
              Descubriste la palabra{" "}
              <span className="font-bold">WEIHNACHTEN</span>.
            </p>
            <p className="text-xs sm:text-sm leading-relaxed max-w-md text-slate-600">
              Las tradiciones hacen parte de los mejores recuerdos del colegio.
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-900">
              ¿Qué era lo que más disfrutabas de la celebración de Navidad en el
              colegio?
            </p>
          </div>
        ) : (
          <p className="text-xs sm:text-sm leading-relaxed max-w-md">
            No te rindas, inténtalo nuevamente hasta lograrlo
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm">
          {isSuccess ? (
            <Button
              size="sm"
              onClick={onContinue}
              disabled={submitting}
              className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm w-full col-span-2"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              ) : (
                <>
                  <span className="truncate">Compartir recuerdo</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </>
              )}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onRetry}
              disabled={submitting}
              className="h-8 px-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-1 shadow-sm w-full"
            >
              <span className="truncate">Intentar de nuevo</span>
              <RotateCcw className="h-3 w-3 shrink-0" />
            </Button>
          )}
        </div>
      </div>
    </MascotDialog>
  );
}
