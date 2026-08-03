import { MascotDialog } from "@/components/shared/mascot-dialog";
import { Button } from "@/components/ui/button";
import { QuizResultDialogProps } from "@/types";

import { RotateCcw, ArrowRight, Loader2 } from "lucide-react";

export function QuizResultDialog({
  open,
  onOpenChange,
  correctAnswers,
  totalQuestions,
  earnedPoints,
  onRetry,
  onContinue,
  submitting = false,
}: QuizResultDialogProps) {
  const isSuccess = correctAnswers >= 3;
  const imageSrc = isSuccess ? "/otto-happy.png" : "/otto-sad.png";
  const title = isSuccess ? "¡Muy bien!" : "¡No te rindas!";
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
          Acertaste <span className="font-bold">{correctAnswers}</span> de{" "}
          <span className="font-bold">{totalQuestions}</span> preguntas y acabas
          de ganar{" "}
          <span className="font-bold text-blue-600">
            +{earnedPoints} puntos
          </span>
        </p>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md">
          ¿Deseas intentarlo de nuevo para ganar más puntos o continuar con el
          resto de la misión?
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3 w-full max-w-sm">
          <Button
            size="sm"
            onClick={onRetry}
            disabled={submitting}
            className="h-8 px-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full text-xs transition-all flex items-center justify-center gap-1 shadow-sm w-full"
          >
            <span className="truncate">Intentar de nuevo</span>
            <RotateCcw className="h-3 w-3 shrink-0" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onContinue}
            disabled={submitting}
            className="h-8 px-2 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold rounded-full text-xs transition-all flex items-center justify-center gap-1 w-full"
          >
            {submitting ? (
              <>
                <span className="truncate">Guardando...</span>
                <Loader2 className="h-3 w-3 animate-spin shrink-0" />
              </>
            ) : (
              <>
                <span className="truncate">Continuar</span>
                <ArrowRight className="h-3 w-3 shrink-0" />
              </>
            )}
          </Button>
        </div>
      </div>
    </MascotDialog>
  );
}
