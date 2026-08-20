"use client";

import { useCallback, useEffect, useReducer, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Search, Send } from "lucide-react";

import { WordsearchGrid } from "@/components/missions/views/wordsearch-grid";
import { WordsearchSuccessDialog } from "@/components/missions/views/wordsearch-success-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/useAuthStore";
import { createClient, IS_MOCK_MODE } from "@/lib/client";
import { WordsearchViewProps } from "@/types";
import { cn } from "@/lib/utils";
import {
    createInitialState,
    wordSearchReducer,
    WORDSEARCH_REFLECTION_QUESTION,
    WORDSEARCH_SHARE_PLACEHOLDER,
} from "@/constants/mission-8";

type Phase = "game" | "share" | "wall";

// Filenames with Spanish chars/spaces → must use inline style + encodeURI
const BG = {
    mobile: "/bg-mobile-white.png",
    game1: "/backgrounds/mission/misión 8 - sopa de letras inicial 1A BG.png",
    game2: "/backgrounds/mission/misión 8 - sopa de letras en proceso 2A BG.png",
    game3: "/backgrounds/mission/misión 8 - sopa de letras completada 3A BG.png",
    modal: "/backgrounds/mission/misión 8 - modal de éxito 4A BG.png",
    share5: "/backgrounds/mission/misión 8 - compartir respuesta (vacío) 5A BG.png",
    share6: "/backgrounds/mission/misión 8 - compartir respuesta (completo - botón activo) 6A BG.png",
    wall: "/backgrounds/mission/muro_mision_8 1.png",
} as const;

function bgStyle(src: string): React.CSSProperties {
    return {
        backgroundImage: `url("${encodeURI(src)}")`,
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
    };
}

export function WordsearchView({ mission, question }: WordsearchViewProps) {
    const router = useRouter();
    const { user } = useAuthStore();

    const [state, dispatch] = useReducer(wordSearchReducer, undefined, createInitialState);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [phase, setPhase] = useState<Phase>("game");
    const [shareText, setShareText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const { foundWordIds, words, status } = state;
    const foundCount = foundWordIds.size;
    const totalWords = words.length;
    const allFound = status === "won";

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Detener el audio cuando se sale de la vista
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    const playSuccessAudio = useCallback(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio("/docs/mission-8/musica/mission 8- rasputin.mp3");
            audioRef.current.volume = 0.5;
        }
        // Solo reproducir desde cero si estaba pausado o terminó (evitar saltos feos si ya está sonando)
        if (audioRef.current.paused) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.error("Auto-play blocked:", e));
        }
    }, []);

    useEffect(() => {
        if (status === "won") {
            const t = setTimeout(() => {
                setShowSuccessModal(true);
                playSuccessAudio();
            }, 100);
            return () => clearTimeout(t);
        }
    }, [status, playSuccessAudio]);

    const handleSuccessContinue = useCallback(() => {
        setShowSuccessModal(false);
        setPhase("share");
        if (audioRef.current) {
            audioRef.current.pause();
        }
    }, []);

    const handleFinalSubmit = useCallback(async () => {
        if (!shareText.trim()) {
            toast.error("Por favor escribe tu reflexión antes de continuar");
            return;
        }
        if (IS_MOCK_MODE || !user) {
            toast.success("¡Misión completada! (modo vista previa)");
            setPhase("wall");
            return;
        }
        try {
            setSubmitting(true);
            const supabase = createClient();
            const { error } = await supabase.from("user_responses").upsert(
                {
                    user_id: user.id,
                    mission_id: mission.id,
                    question_id: question?.id ?? null,
                    selected_option: "wordsearch_completed",
                    text_answer: shareText.trim(),
                    is_correct: true,
                    points_earned: 10,
                },
                { onConflict: "user_id,question_id" },
            );
            if (error) throw error;
            toast.success("¡Misión completada con éxito!");
            setPhase("wall");
        } catch (err: unknown) {
            toast.error("Error al completar la misión", {
                description: err instanceof Error ? err.message : "Error desconocido",
            });
        } finally {
            setSubmitting(false);
        }
    }, [shareText, user, mission, question]);

    // ══════════════════════════════════════════════════════════
    // PHASE: WALL (Muro Final)
    // ══════════════════════════════════════════════════════════
    if (phase === "wall") {
        return (
            // White background for the wall screen — matches Figma
            <div className="w-full min-h-[calc(100dvh-4rem)] bg-white flex flex-col items-center px-4 sm:px-8 py-8 gap-6">

                {/* Centered title */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center">
                    Misión {mission.week_number}: Completada
                </h1>

                {/* Full-width wall image — muro_mision_8 1.png */}
                <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-sm aspect-[16/7]">
                    <Image
                        src={BG.wall}
                        alt="Muro final misión 8 — Colegio Alemán Einigkeit 2026"
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 1200px"
                        className="object-cover object-center"
                        priority
                    />
                </div>

                {/* Bottom row: centered red text (left) + button (right) */}
                <div className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Red bold centered text — matches Figma exactly */}
                    <p className="text-xl sm:text-2xl font-extrabold text-red-600 text-center sm:text-left leading-snug max-w-xl">
                        Cada recuerdo derribó un bloque.{" "}
                        Cada conexión reconstruyó nuestra comunidad.
                    </p>

                    {/* CTA button */}
                    <Button
                        onClick={() => router.push("/")}
                        size="lg"
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-2xl px-6 py-3 shadow-md flex items-center gap-2 shrink-0"
                    >
                        <span>Ver mi certificado</span>
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        );
    }

    // ══════════════════════════════════════════════════════════
    // PHASE: SHARE (5A vacío / 6A con texto)
    // ══════════════════════════════════════════════════════════
    if (phase === "share") {
        const shareBgSrc = shareText.trim() ? BG.share6 : BG.share5;
        const hasText = shareText.trim().length > 0;
        return (
            <>
                {/* Desktop BG */}
                <div className="absolute inset-0 -z-10 pointer-events-none hidden lg:block" style={bgStyle(shareBgSrc)} />
                {/* Mobile: white */}
                <div className="absolute inset-0 -z-10 pointer-events-none lg:hidden bg-white" />

                {/* Zero-scroll outer wrapper */}
                <div className="w-full h-full lg:h-[calc(100dvh-4rem)] flex flex-col lg:flex-row overflow-hidden">

                    {/* ── LEFT: form column ─────────────────────────── */}
                    <div className="flex-1 flex flex-col gap-4 px-4 sm:px-8 py-4 overflow-y-auto">

                        {/* Header */}
                        <div className="flex items-center gap-3 shrink-0">
                            <Button
                                onClick={() => setPhase("game")}
                                variant="destructive"
                                size="icon"
                                className="w-9 h-9 rounded-xl bg-red-600 hover:bg-red-700 shrink-0"
                            >
                                <ArrowLeft className="w-4 h-4 text-white" />
                            </Button>
                            <div className="flex items-center gap-2 text-sm font-bold">
                                <span className="text-blue-600">Misión {mission.week_number}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-500 font-normal">Wortsuche</span>
                            </div>
                        </div>

                        {/* Spark icon + big title */}
                        <div className="flex items-start gap-3 shrink-0">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-lg">
                                ✦
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
                                    Ahora que completaste la sopa de letras,
                                </h1>
                                <p className="text-sm sm:text-base text-slate-500 mt-1">
                                    Cuéntanos, ¿Qué palabra agregarías a esta sopa de letras para representar tu paso por el colegio?
                                </p>
                            </div>
                        </div>

                        {/* Textarea card — flex-1 so it grows to fill remaining space */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden flex-1 flex flex-col shadow-sm">
                                <Textarea
                                    value={shareText}
                                    onChange={(e) => setShareText(e.target.value)}
                                    placeholder="Compártenos tu respuesta...*"
                                    className="flex-1 min-h-[160px] lg:min-h-0 border-0 resize-none rounded-2xl p-4 text-sm placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                            </div>
                        </div>

                        {/* Footer white banner card — contrast for buttons */}
                        <Card className="shrink-0 bg-white/95 border-slate-200/60 rounded-2xl shadow-sm py-0">
                            <CardContent className="flex items-center justify-between p-3 sm:p-4 gap-3">
                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline"
                                    className="rounded-full border-red-400 bg-white text-red-600 hover:bg-red-50 font-medium px-4 sm:px-5 text-sm shadow-none shrink-0"
                                >
                                    <Link href="/">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Salir de la misión
                                    </Link>
                                </Button>
                                <Button
                                    onClick={handleFinalSubmit}
                                    size="lg"
                                    disabled={!hasText || submitting}
                                    className={cn(
                                        "rounded-xl font-medium px-5 text-sm flex items-center gap-2 shadow-none shrink-0 transition-colors",
                                        hasText
                                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                                            : "bg-slate-300 text-slate-500 cursor-not-allowed",
                                    )}
                                >
                                    <span>{submitting ? "Guardando..." : "Finalizar misión"}</span>
                                    {!submitting && <span className="text-base">✓</span>}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ── RIGHT: mascot column — desktop only ──────── */}
                    <div className="hidden lg:flex lg:w-[360px] xl:w-[420px] shrink-0 flex-col items-center justify-end relative">
                        {/* Speech bubble */}
                        <div className="absolute top-[18%] left-2 z-10">
                            <div className="relative bg-[#FFF8E7] rounded-2xl px-5 py-3 shadow-md max-w-[175px]">
                                <p className="text-slate-900 font-bold text-base leading-tight">Compártenos</p>
                                <p className="text-red-600 font-bold text-base leading-tight">tu respuesta</p>
                                {/* Triangle pointing down toward mascot */}
                                <span
                                    className="absolute -bottom-3 left-10 w-0 h-0"
                                    style={{
                                        borderLeft: "12px solid transparent",
                                        borderRight: "12px solid transparent",
                                        borderTop: "12px solid #FFF8E7",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Otto mascot */}
                        <div className="relative w-full h-full max-h-[calc(100dvh-4rem)]">
                            <Image
                                src="/mascot/otto-crossword-step.png"
                                alt="Otto señalando: Compártenos tu respuesta"
                                fill
                                sizes="(max-width: 1280px) 360px, 420px"
                                className="object-contain object-bottom"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // ══════════════════════════════════════════════════════════
    // PHASE: GAME (1A / 2A / 3A)  — Fiel al Figma
    //
    // Layout desktop:
    //  ┌─────────────────────────────────────────────────────┐
    //  │ ← Misión 8  •  Wortsuche                0/8 badge  │
    //  │ 🔍 Sopa de letras                                   │
    //  │    Completa la sopa de letras…                      │
    //  │ ┌───────────────────────────┐  Lista de palabras   │
    //  │ │  GRID con borde azul      │  (columna derecha)   │
    //  │ │                           │  Mascota Otto         │
    //  │ └───────────────────────────┘  (inferior derecha)  │
    //  │ [Salir]            Has encontrado X de 8 palabras   │
    //  └─────────────────────────────────────────────────────┘
    // ══════════════════════════════════════════════════════════
    const gameBgSrc = showSuccessModal ? BG.modal : allFound ? BG.game3 : foundCount > 0 ? BG.game2 : BG.game1;

    return (
        <>
            {/* Desktop BG */}
            <div className="absolute inset-0 -z-10 pointer-events-none hidden lg:block" style={bgStyle(gameBgSrc)} />
            {/* Mobile: white */}
            <div className="absolute inset-0 -z-10 pointer-events-none lg:hidden bg-white" />

            {/* Zero-scroll wrapper */}
            <div className="w-full flex flex-col gap-2 px-4 sm:px-6 lg:px-8 py-2 overflow-x-hidden
                      lg:h-[calc(100dvh-4rem)] lg:overflow-hidden">

                {/* ── Header row ──────────────────────────────────── */}
                <div className="flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="destructive" size="icon" className="w-9 h-9 rounded-xl bg-red-600 hover:bg-red-700 shrink-0">
                            <Link href="/"><ArrowLeft className="w-4 h-4 text-white" /></Link>
                        </Button>
                        <div className="flex items-center gap-2 text-sm font-bold">
                            <span className="text-blue-600">Misión {mission.week_number}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500 font-normal">Wortsuche</span>
                        </div>
                    </div>
                    <span className={cn(
                        "text-xs font-bold px-3 py-1 rounded-full border transition-colors duration-300",
                        allFound ? "bg-emerald-100 border-emerald-300 text-emerald-700" : "bg-blue-50 border-blue-200 text-blue-700",
                    )}>
                        {foundCount}/{totalWords}
                    </span>
                </div>

                {/* ── Title row ───────────────────────────────────── */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <Search className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">Sopa de letras</h1>
                        <p className="text-xs text-slate-500">Encuentra las {totalWords} palabras ocultas.Desliza desde la primera letra hasta la última sin soltar.</p>
                    </div>
                </div>

                {/* ── Main content: [Grid] [Word list + Otto] ──────── */}
                {/* flex-1 min-h-0: gives the grid area all remaining vertical space */}
                <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4">

                    {/* Grid card — overflow-hidden clips the CSS-grid to this flex cell */}
                    <div className="flex-1 min-h-0 rounded-2xl border-2 border-blue-500 bg-white overflow-hidden p-2 sm:p-3">
                        {/* h-full passes the exact available height down to <WordsearchGrid> */}
                        <div className="w-full h-full">
                            <WordsearchGrid state={state} dispatch={dispatch} />
                        </div>
                    </div>

                    {/* Right column: word list + Otto */}
                    <div className="flex flex-row lg:flex-col justify-between gap-4 lg:gap-0 lg:w-56 xl:w-64 shrink-0">

                        {/* Word list — vertical, clean typography */}
                        <div className="flex-1 lg:flex-none bg-white/80 rounded-2xl p-4 flex flex-col gap-2">
                            {[...words]
                                .sort((a, b) => a.displayOrder - b.displayOrder)
                                .map((w) => {
                                    const found = foundWordIds.has(w.id);
                                    return (
                                        <span
                                            key={w.id}
                                            className={cn(
                                                "text-sm font-medium transition-all duration-300",
                                                found ? "line-through text-emerald-600 font-semibold" : "text-slate-800",
                                            )}
                                        >
                                            {w.word.charAt(0) + w.word.slice(1).toLowerCase()}
                                        </span>
                                    );
                                })}
                        </div>

                        {/* Otto mascot — side by side on mobile, bottom of right column on desktop */}
                        <div className="relative shrink-0 w-32 h-36 sm:w-40 sm:h-48 lg:w-auto lg:h-48 xl:h-60 mt-auto mb-0 lg:mb-4 xl:mb-6">
                            <Image
                                src="/mascot/Juego crossword Otto.png"
                                alt="Otto ASODECA"
                                fill
                                className="object-contain object-bottom"
                                priority
                            />
                        </div>
                    </div>
                </div>

                {/* ── Footer row — white card for contrast against BG image ── */}
                <Card className="shrink-0 bg-white/95 border-slate-200/80 rounded-2xl shadow-sm py-0">
                    <CardContent className="flex items-center justify-between p-3 sm:p-4 gap-2">
                        <Button asChild size="lg" variant="outline" className="rounded-full border-red-300 bg-white text-red-600 hover:bg-red-50 font-medium px-4 sm:px-5 text-sm shadow-none shrink-0">
                            <Link href="/">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Salir de la misión
                            </Link>
                        </Button>

                        {/* Desktop: counter text, shows Continuar when done */}
                        <div className="hidden lg:block">
                            {allFound ? (
                                <Button onClick={() => { setShowSuccessModal(true); playSuccessAudio(); }} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl px-5 py-2.5 flex items-center gap-2 shadow-sm">
                                    <span>Continuar</span><ArrowRight className="w-4 h-4" />
                                </Button>
                            ) : (
                                <p className="text-sm font-bold text-slate-700">
                                    Has encontrado <span className="text-blue-600">{foundCount}</span> de {totalWords} palabras
                                </p>
                            )}
                        </div>

                        {/* Mobile: Continuar button (disabled until done) */}
                        <div className="lg:hidden">
                            <Button
                                onClick={() => { setShowSuccessModal(true); playSuccessAudio(); }}
                                disabled={!allFound}
                                size="lg"
                                className={cn(
                                    "rounded-xl font-medium px-4 text-sm flex items-center gap-2 shadow-none shrink-0",
                                    allFound ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-300 text-slate-500 cursor-not-allowed",
                                )}
                            >
                                <span>Continuar</span><ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

            </div>

            <WordsearchSuccessDialog
                open={showSuccessModal}
                onOpenChange={setShowSuccessModal}
                onContinue={handleSuccessContinue}
            />
        </>
    );
}
