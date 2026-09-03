"use client";

import { MascotDialog } from "@/components/shared/mascot-dialog";
import { Button } from "@/components/ui/button";

import { RotateCcw, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue?: () => void;
  pointsEarned?: number;
}

export function InviteDialog({
  open,
  onOpenChange,
  onContinue,
  pointsEarned = 0,
}: InviteDialogProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (!audioRef.current)
      audioRef.current = new Audio("/missions/m5/falco-der-kommissar.mp3");
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
  const title = "¡Felicidades!";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[95vw] sm:!max-w-3xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl
                   bg-white lg:bg-cover lg:bg-center lg:bg-no-repeat
                   lg:bg-[url('/backgrounds/mission/bg-mission-5.png')]"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-full sm:flex-row items-center p-6 sm:p-10 gap-6 sm:gap-8">
          <div className="lg:relative lg:w-full lg:sm:w-1/2 lg:h-52 lg:sm:h-72 lg:flex lg:items-center justify-center"></div>
          <div className="relative w-full h-fit lg:w-1/2 flex items-center justify-center">
            <div className="flex flex-col h-full justify-center gap-3">
              <h2 className="text-3xl sm:text-4xl text-center font-extrabold text-red-600 tracking-tight leading-none">
                {title}
              </h2>
              <p className="text-md text-slate-800 text-center font-medium leading-snug">
                Cuando un ABI acepta tu invitación ganas puntos!
                <br />
                <br />
                <span className="font-extrabold text-3xl text-blue-500 block">
                  +{pointsEarned}
                </span>
                <span className="font-bold text-lg text-blue-500 block">
                  puntos
                </span>
                <br />
                <span className="text-slate-900 block">
                  ¡Sigue compartiendo y acumula más puntos!
                </span>
              </p>
              <div className="flex flex-col gap-2 mt-3 w-full max-w-sm">
                {onContinue && (
                  <Button
                    size="lg"
                    onClick={onContinue}
                    className="h-12 w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-md"
                  >
                    <>
                      Seguir compartiendo{" "}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
