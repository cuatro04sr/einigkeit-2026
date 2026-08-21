"use client";

import { MascotDialog } from "@/components/shared/mascot-dialog";
import { Button } from "@/components/ui/button";

import { RotateCcw, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

interface MemoryResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSuccess: boolean;
  earnedPoints: number;
  onRetry: () => void;
  onContinue?: () => void;
  submitting?: boolean;
}

export function MemoryResultDialog({
  open,
  onOpenChange,
  isSuccess,
  onRetry,
  onContinue,
  submitting = false,
}: MemoryResultDialogProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (!audioRef.current)
      audioRef.current = new Audio("/missions/m3/luftballons.mp3");
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
    ? "/mascot/otto-cards-dialog.png"
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
              Cada pareja que encontraste representa una parte de{" "}
              <span className="font-bold text-slate-900">
                la historia que compartimos.
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
                  Compartir recuerdo <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
          {!isSuccess && (
            <Button
              size="lg"
              onClick={onRetry}
              className="h-12 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md"
            >
              Intentar de nuevo <RotateCcw className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </MascotDialog>
  );
}
