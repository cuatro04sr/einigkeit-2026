"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sparkles, ArrowRight, Send } from "lucide-react";

import { PuzzleGame } from "@/components/jigsaw/PuzzleGame";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { JIGSAW_PIECES, JIGSAW_REFLECTION_QUESTION, JIGSAW_SHARE_PLACEHOLDER } from "@/constants/mission-7";
import { MascotCallout } from "@/components/shared/mascot-callout";
import { MascotDialog } from "@/components/shared/mascot-dialog";

type Phase = "game" | "success" | "share" | "wall";

const BG = {
    mobile: "/bg-mobile-white.png",
    game: "/backgrounds/mission/mision 7- juego BG.png",
    congrats: "/backgrounds/mission/mision 7- felicitaciones BG.png",
    wall: "/backgrounds/mission/docs/mission 7-rompecabezas pantallas/mision 7-solo muro.png",
} as const;

function bgStyle(src: string): React.CSSProperties {
    return {
        backgroundImage: `url("${encodeURI(src)}")`,
        backgroundSize: "cover",
        backgroundPosition: "center bottom", // Keeps the rocks visible at the bottom of the screen
        backgroundRepeat: "no-repeat",
    };
}

export function JigsawView({ mission, question }: { mission: any; question?: any }) {
    const router = useRouter();

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [phase, setPhase] = useState<Phase>("game");
    const [shareText, setShareText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Detener el audio cuando se sale de la vista
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    const handleWin = useCallback(() => {
        setShowSuccessModal(true);
        if (!audioRef.current) {
            audioRef.current = new Audio("/backgrounds/mission/docs/musica/mission 7-WindOfChange.mp3");
            audioRef.current.volume = 0.5;
        }
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.error("Auto-play blocked:", e));
    }, []);

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

        // Mock success directly since we dont use Supabase
        setSubmitting(true);
        setTimeout(() => {
            toast.success("¡Misión completada con éxito!");
            setPhase("wall");
            setSubmitting(false);
        }, 800);
    }, [shareText]);

    // ══════════════════════════════════════════════════════════
    // PHASE: WALL (Muro Final)
    // ══════════════════════════════════════════════════════════
    if (phase === "wall") {
        return (
            <div className="w-full min-h-[calc(100dvh-4rem)] bg-slate-50 flex flex-col items-center px-4 sm:px-8 py-10 gap-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-center">
                    Misión {mission.week_number}: Completada
                </h1>

                <Card className="w-full max-w-5xl rounded-3xl overflow-hidden shadow-lg border-none bg-white p-0">
                    <CardContent className="p-0">
                        <div className="relative w-full aspect-[21/9]">
                            <Image
                                src={BG.wall}
                                alt="Muro final misión 7"
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 1200px"
                                className="object-cover object-center"
                                priority
                            />
                        </div>
                        <div className="w-full p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-red-600 text-center sm:text-left leading-snug tracking-tight max-w-3xl">
                                Una última misión nos separa de la reunificación.
                            </h2>
                            <Button onClick={() => router.push("/")} size="lg" className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl px-8 py-6 shadow-md flex items-center gap-3 shrink-0 text-lg transition-transform hover:scale-105">
                                <span>Continuar</span><ArrowRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ══════════════════════════════════════════════════════════
    // PHASE: SHARE (Pantallas 5 y 6)
    // ══════════════════════════════════════════════════════════
    if (phase === "share") {
        const hasText = shareText.trim().length > 0;
        return (
            <>
                <div className="absolute inset-0 -z-10 pointer-events-none hidden lg:block" style={bgStyle(BG.game)} />
                <div className="absolute inset-0 -z-10 pointer-events-none lg:hidden bg-slate-50" />

                <div className="flex flex-col w-full h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-5rem)] overflow-hidden relative pb-2 pt-4 lg:pt-6">
                    <div className="flex-1 flex flex-col items-center min-h-0 w-full">
                        <div className="w-full max-w-[1500px] px-4 sm:px-8 lg:px-12 flex flex-col h-full min-h-0">

                            <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-8 xl:gap-16 overflow-y-auto lg:overflow-visible min-h-0 pb-2">
                                {/* LEFT COLUMN: Form */}
                                <div className="flex-[2.5] flex flex-col pt-2 h-full z-10 w-full min-w-0 pr-0">
                                    <div className="flex flex-col gap-3 lg:gap-4 shrink-0 mb-4 lg:mb-6 w-full">
                                        <div className="flex items-center gap-3">
                                            <Button onClick={() => setPhase("game")} size="icon" className="w-[30px] h-[30px] rounded-full bg-red-600 hover:bg-red-700 shrink-0">
                                                <ArrowLeft className="w-4 h-4 text-white" />
                                            </Button>
                                            <div className="flex items-center gap-2 text-[15px] font-bold text-blue-700">
                                                <span>Misión 7</span>
                                                <span className="text-slate-300">•</span>
                                                <span className="text-slate-500 font-normal">Puzzle</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 lg:gap-4 shrink-0 mt-1 lg:mt-2">
                                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-[#E5F5E9] flex items-center justify-center shrink-0">
                                                <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-[#0E8A38] fill-[#0E8A38]" />
                                            </div>
                                            <div className="flex flex-col">
                                                <h1 className="text-2xl lg:text-[40px] font-extrabold text-slate-900 leading-tight tracking-tight">
                                                    Ahora que completaste el rompecabezas,
                                                </h1>
                                                <p className="text-sm sm:text-[17px] text-slate-600 font-medium mt-1">
                                                    <span className="font-semibold text-slate-800">Cuéntanos:</span> Si pudieras volver por un día al colegio, ¿Qué sería lo primero que harías?
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* FORM CARD */}
                                    <div className="flex-1 flex flex-col min-h-0 pt-2 lg:pt-4">
                                        <div className="border border-slate-300 rounded-[12px] bg-white overflow-hidden flex-1 flex flex-col shadow-sm min-h-[140px] lg:min-h-[300px]">
                                            <Textarea
                                                value={shareText}
                                                onChange={(e) => setShareText(e.target.value)}
                                                placeholder="Compártenos tu respuesta...*"
                                                className="flex-1 w-full h-full border-0 resize-none p-4 lg:p-5 text-base lg:text-xl placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT COLUMN: Mascot */}
                                <div className="flex lg:flex relative w-full h-[180px] sm:h-[240px] lg:h-full max-w-[350px] xl:max-w-[450px] shrink-0 flex-col items-center justify-end z-20 pb-0 lg:pb-4 mx-auto lg:mx-0 mt-4 lg:mt-0">
                                    {/* Speech Bubble floating cleanly away from his ear */}
                                    <div className="absolute top-[10%] lg:top-[25%] xl:top-[30%] right-[65%] lg:right-[60%] xl:right-[65%] z-30 scale-90 lg:scale-100 origin-bottom-right">
                                        <div className="relative bg-[#FFF8E7] rounded-[50px] px-6 py-4 shadow-sm text-center border border-[#E8E2D5] whitespace-nowrap min-w-[150px]">
                                            <p className="text-slate-900 font-extrabold text-[#0F172A] text-lg leading-tight">Compártenos</p>
                                            <p className="text-red-600 font-extrabold text-lg leading-tight">tu respuesta</p>
                                            {/* Tail pointing right to his ear */}
                                            <span className="absolute bottom-2 -right-[10px] w-0 h-0 border-t-[10px] border-b-[10px] border-l-[12px] border-transparent border-l-[#FFF8E7] origin-center rotate-[15deg]" />
                                            <span className="absolute bottom-2 -right-[12px] w-0 h-0 border-t-[10px] border-b-[10px] border-l-[12px] border-transparent border-l-[#E8E2D5] origin-center rotate-[15deg] -z-10" />
                                        </div>
                                    </div>
                                    {/* Otto horizontally centered in the remaining space */}
                                    <div className="relative w-full max-w-[220px] xl:max-w-[250px] h-[90%] lg:h-[75%] xl:h-[80%] z-20 origin-bottom mx-auto pr-0 xl:pr-4">
                                        <Image
                                            src="/mascot/mission 7- otto- respuestas escritas.png"
                                            alt="Otto pidiendo respuestas escritas"
                                            fill
                                            sizes="300px"
                                            className="object-contain object-bottom"
                                            priority
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Enforced gap above the Banner */}
                            <div className="h-4 lg:h-8 shrink-0 w-full" />

                            {/* Banner de Salida en la parte inferior */}
                            <div className="w-full bg-[#FFF8E7]/90 border border-[#F0EBE1] backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between z-30 mt-auto shrink-0 mb-4 xl:mb-8 shadow-sm">
                                <Button asChild size="lg" variant="outline" className="rounded-full border-red-400 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold px-6 py-5 shadow-sm shrink-0">
                                    <Link href="/"><ArrowLeft className="w-5 h-5 mr-3" />Salir de la misión</Link>
                                </Button>
                                <Button
                                    onClick={handleFinalSubmit}
                                    size="lg"
                                    disabled={!hasText || submitting}
                                    className={cn("rounded-2xl font-bold px-6 py-5 flex items-center gap-2 shadow-none shrink-0 transition-all", hasText ? "bg-red-600 hover:bg-red-700 text-white" : "bg-[#E2E8F0] text-[#94A3B8]")}
                                >
                                    <span>{submitting ? "Publicando..." : "Finalizar misión"}</span>
                                    {!submitting && <span className="text-lg">✓</span>}
                                </Button>
                            </div>

                        </div>
                    </div>
                </div>
            </>
        );
    }

    // ══════════════════════════════════════════════════════════
    // PHASE: GAME (Pantallas 1, 2, 3)
    // ══════════════════════════════════════════════════════════
    return (
        <>
            {/* Modal Éxito (Pantalla 4) */}
            <MascotDialog
                open={showSuccessModal}
                onOpenChange={setShowSuccessModal}
                imageSrc="/mascot/mission 7-felicitaciones-otto.png"
                bgImageSrc="/backgrounds/mission/mision 7- felicitaciones BG.png"
                title="Misión Superada!"
            >
                <div className="flex flex-col gap-3 lg:gap-6 justify-center w-full z-20 text-left py-0 lg:py-4 pb-2 lg:pb-0">
                    <h1 className="text-red-600 text-[34px] sm:text-4xl lg:text-[45px] font-extrabold tracking-tight leading-none mt-1 lg:mt-0">
                        ¡Felicitaciones!
                    </h1>
                    <p className="text-[15px] sm:text-lg lg:text-[22px] font-medium text-[#1E293B] leading-snug">
                        Acabas de <strong className="font-bold text-[#000000]">reconstruir una parte</strong> de la historia de nuestro colegio.
                    </p>
                    <p className="text-[15px] sm:text-lg lg:text-[21px] font-bold text-[#000000] leading-snug mb-2 lg:mb-0">
                        Si pudieras volver por un día al colegio,<br className="hidden lg:block" /> ¿Qué sería lo primero que harías?
                    </p>
                    <div className="w-full flex justify-center lg:justify-start">
                        <Button onClick={handleSuccessContinue} size="lg" className="w-full lg:w-fit bg-[#E50A1F] hover:bg-red-700 text-white rounded-xl text-lg font-bold px-8 py-6 lg:py-6 shadow-sm transition-all group">
                            Responder pregunta <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </MascotDialog>

            {/* Backgrounds */}
            <div className="fixed inset-0 -z-10 bg-slate-50 lg:hidden" />
            <div className="fixed inset-0 -z-10 hidden lg:block" style={bgStyle(BG.game)} />

            <div className="flex flex-col w-full h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-5rem)] overflow-hidden relative pb-1 lg:pb-2 pt-3 lg:pt-6">
                {/* Contenedor principal de Juego */}
                <div className="flex-1 flex flex-col items-center min-h-0 w-full">
                    <div className="w-full max-w-[1600px] px-3 sm:px-4 lg:px-12 flex flex-col h-full min-h-0">
                        {/* Scroll container that avoids overlapping banner */}
                        <div className="flex-1 overflow-y-auto min-h-0 w-full flex flex-col pb-2 shrink lg:pr-0 custom-scrollbar">
                            {/* Headers */}
                            <div className="flex flex-col gap-2 lg:gap-4 shrink-0 mb-2 lg:mb-6 w-full">
                                <div className="flex items-center gap-2 lg:gap-3">
                                    <Button onClick={() => router.push("/")} size="icon" className="w-[24px] h-[24px] lg:w-[30px] lg:h-[30px] rounded-full bg-red-600 hover:bg-red-700 shrink-0">
                                        <ArrowLeft className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                                    </Button>
                                    <div className="flex items-center gap-2 text-[13px] lg:text-[15px] font-bold text-blue-700">
                                        <span>Misión 7</span>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-slate-500 font-normal">Puzzle</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 lg:gap-4">
                                    <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-full bg-[#E5F5E9] flex items-center justify-center shrink-0">
                                        <span className="text-[#0E8A38] text-lg lg:text-2xl font-bold">☺</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <h1 className="text-xl lg:text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">Completa el rompecabezas,</h1>
                                        <p className="text-slate-600 text-[13px] sm:text-sm lg:text-lg font-medium mt-0 lg:mt-1 leading-snug">
                                            Selecciona con click la pieza y haz click sobre el tablero, si es la ficha correcta, aparecerá. Si no es la ficha correcta, inténtalo con otra ficha.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* GAME COMPONENT (Grilla y Bandeja contenidas) */}
                            <div className="w-full relative z-10 flex-1 flex flex-col min-h-0">
                                <div className="flex flex-col lg:flex-row gap-2 lg:gap-8 w-full items-start relative min-h-0 h-auto lg:h-full">
                                    <div className="flex-[1.5] xl:flex-[2] w-full min-w-0">
                                        <PuzzleGame pieces={JIGSAW_PIECES} onWin={handleWin} />
                                    </div>

                                    {/* Otto Mascot next to the tray */}
                                    <div className="relative w-[160px] h-[160px] sm:w-[220px] sm:h-[220px] lg:w-[220px] lg:h-full shrink-0 mx-auto lg:mx-0 lg:-ml-4 z-20 mt-4 lg:mt-0 lg:mb-0">
                                        <Image
                                            src="/mascot/mision 7-otto juego rompecabezas.png"
                                            alt="Otto"
                                            fill
                                            className="object-contain object-bottom"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Banner de Salida en la parte inferior */}
                        <div className="w-full bg-[#FFF8E7]/90 border border-[#F0EBE1] backdrop-blur-sm rounded-xl lg:rounded-2xl p-2 sm:p-3 lg:p-3 flex items-center z-20 mt-auto shrink-0 mb-1 lg:mb-3 sticky bottom-0">
                            <Button asChild size="lg" variant="outline" className="rounded-xl lg:rounded-full border-red-400 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold px-4 lg:px-6 py-2 lg:py-3 shadow-sm shrink-0 w-full sm:w-auto h-auto">
                                <Link href="/" className="flex items-center justify-center w-full"><ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3" />Salir de la misión</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
