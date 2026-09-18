"use client";

import { MascotDialog } from "@/components/shared/mascot-dialog";
import { Button } from "@/components/ui/button";

import { ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

interface PuzzleResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSuccess: boolean;
  onContinue?: () => void;
  submitting?: boolean;
}

export function PuzzleResultDialog({
  open,
  onOpenChange,
  isSuccess,
  onContinue,
  submitting = false,
}: PuzzleResultDialogProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (!audioRef.current)
      audioRef.current = new Audio("/missions/m7/rock-me-amadeus.mp3");
    if (open && isSuccess) {
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
  }, [open, isSuccess]);
  const title = isSuccess ? "¡Felicidades!" : "¡Se acabó el tiempo!";
  const imageSrc = isSuccess
    ? "/mascot/otto-puzzle-dialog.png"
    : "/mascot/otto-sad.png";
  return (
    <MascotDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      imageSrc={imageSrc}
      imageAlt={title}
    >
      <div className="flex flex-col h-full justify-center gap-3">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-red-600 tracking-tight leading-none">
          {title}
        </h2>
        <p className="text-base sm:text-lg text-slate-800 font-medium leading-snug">
          {isSuccess ? (
            <>
              Acabas de{" "}
              <span className="font-bold text-slate-900">
                reconstruir una parte
              </span>{" "}
              de la historia de nuestro colegio.
              <span className="font-bold text-slate-900 block">
                Si pudieras volver por un día al colegio, ¿Qué sería lo primero
                que harías?
              </span>
            </>
          ) : (
            <>
              No te preocupes, los recuerdos siguen ahí. ¡Inténtalo de nuevo y
              demuestra tu agilidad!
            </>
          )}
        </p>
        <div className="flex flex-col gap-2 mt-3 w-full max-w-sm">
          {isSuccess && onContinue && (
            <Button
              size="lg"
              onClick={onContinue}
              disabled={submitting}
              className="h-12 w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-md"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Responder pregunta <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </MascotDialog>
  );
}
