"use client";

import { MascotDialog } from "@/components/shared/mascot-dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw, ArrowRight, Loader2 } from "lucide-react";

interface MemoryResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSuccess: boolean; // true si completó todos los pares, false si se acabó el tiempo
  earnedPoints: number; // Será 10 si es éxito, 0 si falló
  onRetry: () => void;
  onContinue?: () => void; // Opcional porque en timeout no existe
  submitting?: boolean;
}

export function MemoryResultDialog({
  open,
  onOpenChange,
  isSuccess,
  earnedPoints,
  onRetry,
  onContinue,
  submitting = false,
}: MemoryResultDialogProps) {
  const title = isSuccess ? "¡Felicidades!" : "¡Se acabó el tiempo!";
  const imageSrc = isSuccess
    ? "/mascot/otto-happy.png"
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
