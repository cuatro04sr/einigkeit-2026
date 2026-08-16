"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WordsearchSuccessDialogProps } from "@/types";

export function WordsearchSuccessDialog({
    open,
    onOpenChange,
    onContinue,
}: WordsearchSuccessDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="w-[95vw] sm:!max-w-3xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white"
            >
                <DialogHeader className="sr-only">
                    <DialogTitle>¡Encontraste todas las palabras!</DialogTitle>
                </DialogHeader>

                {/* Two-column layout: mascot left, text right — matching Figma 4A */}
                <div className="flex flex-col sm:flex-row items-stretch min-h-[340px] sm:min-h-[380px]">

                    {/* ── Left: mascot area with confetti bg ────────────── */}
                    <div className="relative sm:w-[45%] shrink-0 bg-white min-h-[220px] sm:min-h-0 overflow-hidden">
                        {/* Colorful confetti dots — matching Figma */}
                        <div className="absolute inset-0 pointer-events-none" aria-hidden>
                            {[
                                { x: "20%", y: "12%", color: "bg-red-500", size: "w-3 h-3" },
                                { x: "75%", y: "8%", color: "bg-blue-500", size: "w-2 h-2" },
                                { x: "10%", y: "40%", color: "bg-yellow-400", size: "w-2 h-2" },
                                { x: "80%", y: "30%", color: "bg-slate-800", size: "w-1.5 h-1.5" },
                                { x: "55%", y: "5%", color: "bg-green-500", size: "w-2 h-2" },
                                { x: "65%", y: "20%", color: "bg-red-400", size: "w-1.5 h-1.5" },
                                { x: "30%", y: "70%", color: "bg-blue-400", size: "w-2 h-2" },
                                { x: "85%", y: "60%", color: "bg-yellow-500", size: "w-1.5 h-1.5" },
                            ].map((dot, i) => (
                                <span
                                    key={i}
                                    className={`absolute rounded-sm rotate-12 ${dot.color} ${dot.size}`}
                                    style={{ left: dot.x, top: dot.y }}
                                />
                            ))}
                        </div>

                        {/* Otto mascot — otto-crossword-game.png */}
                        <div className="relative w-full h-full min-h-[220px]">
                            <Image
                                src="/mascot/otto-crossword-game.png"
                                alt="Otto celebrando"
                                fill
                                sizes="(max-width: 640px) 90vw, 45vw"
                                className="object-contain object-bottom"
                                priority
                            />
                        </div>
                    </div>

                    {/* ── Right: text content ──────────────────────────── */}
                    <div className="flex-1 flex flex-col justify-center gap-4 px-6 sm:px-8 py-8">
                        {/* Title — red, large, bold — matches Figma */}
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-red-600 leading-tight tracking-tight">
                            ¡Encontraste todas las palabras!
                        </h2>

                        {/* Body paragraph */}
                        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                            Las tradiciones y personas que hicieron parte del colegio dejan huellas que perduran en el tiempo.
                        </p>

                        {/* Bold question */}
                        <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                            ¿Qué palabra agregarías a esta sopa de letras para representar tu paso por el colegio?
                        </p>

                        {/* CTA button — red, full-width on mobile */}
                        <Button
                            size="lg"
                            onClick={onContinue}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl px-6 py-3 shadow-md hover:shadow-lg transition-all flex items-center gap-2 w-full sm:w-auto mt-2"
                        >
                            <span>Compartir respuesta</span>
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
