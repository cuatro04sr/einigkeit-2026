"use client";

import { ArrowLeft, ArrowRight, Trophy } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import Link from "next/link";

import { CrosswordOption, QuizViewProps, UserResponsePayload } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/client";

const GRID_CONFIG = {
  rows: 11,
  cols: 14,
  words: [
    {
      id: 6,
      word: "OKTOBERFEST",
      direction: "horizontal",
      startRow: 0,
      startCol: 3,
    },
    {
      id: 1,
      word: "OSTERHASE",
      direction: "vertical",
      startRow: 0,
      startCol: 3,
    },
    { id: 7, word: "PIANO", direction: "vertical", startRow: 1, startCol: 1 },
    { id: 3, word: "ANUARIO", direction: "vertical", startRow: 2, startCol: 5 },
    {
      id: 2,
      word: "NIKOLAUS",
      direction: "vertical",
      startRow: 3,
      startCol: 7,
    },
    {
      id: 4,
      word: "LATERNENFEST",
      direction: "horizontal",
      startRow: 3,
      startCol: 0,
    },
    {
      id: 5,
      word: "ASODECA",
      direction: "horizontal-inverted",
      startRow: 8,
      startCol: 7,
    },
  ],
} as const;

export function CrosswordView({ mission, questions }: QuizViewProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const supabase = useMemo(() => createClient(), []);
  const question = useMemo(
    () => (Array.isArray(questions) ? questions[0] : questions),
    [questions],
  );
  const crosswordData = useMemo(
    () => (question?.options as unknown as CrosswordOption[]) || [],
    [question],
  );
  const [gridState, setGridState] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const cellMap = useMemo(() => {
    const map: Record<
      string,
      {
        wordId: number;
        charIndex: number;
        isStart: boolean;
        direction: string;
      }[]
    > = {};
    GRID_CONFIG.words.forEach((w) => {
      for (let i = 0; i < w.word.length; i++) {
        let r: number, c: number;
        if (w.direction === "horizontal") {
          r = w.startRow;
          c = w.startCol + i;
        } else if (w.direction === "horizontal-inverted") {
          r = w.startRow;
          c = w.startCol - i;
        } else {
          r = w.startRow + i;
          c = w.startCol;
        }
        const key = `${r}-${c}`;
        if (!map[key]) map[key] = [];
        map[key].push({
          wordId: w.id,
          charIndex: i,
          isStart: i === 0,
          direction: w.direction,
        });
      }
    });
    return map;
  }, []);
  const solvedWords = useMemo(() => {
    const solved: Record<number, boolean> = {};
    GRID_CONFIG.words.forEach((w) => {
      let currentWordStr = "";
      for (let i = 0; i < w.word.length; i++) {
        let r: number, c: number;
        if (w.direction === "horizontal") {
          r = w.startRow;
          c = w.startCol + i;
        } else if (w.direction === "horizontal-inverted") {
          r = w.startRow;
          c = w.startCol - i;
        } else {
          r = w.startRow + i;
          c = w.startCol;
        }
        currentWordStr += (gridState[`${r}-${c}`] || "").toUpperCase();
      }
      solved[w.id] = currentWordStr === w.word;
    });
    return solved;
  }, [gridState]);
  const solvedCount = Object.values(solvedWords).filter(Boolean).length;
  const handleCellChange = useCallback((r: number, c: number, val: string) => {
    const char = val.toUpperCase().slice(-1);
    setGridState((prev) => ({ ...prev, [`${r}-${c}`]: char }));
  }, []);
  const handleSubmit = useCallback(async () => {
    if (!user) return toast.error("Inicia sesión para guardar tu progreso");
    if (solvedCount < GRID_CONFIG.words.length) {
      return toast.error("Aún hay respuestas incorrectas o incompletas.");
    }
    try {
      setSubmitting(true);
      const payload: UserResponsePayload = {
        user_id: user.id,
        mission_id: mission.id,
        question_id: question.id,
        selected_option: "completed",
        is_correct: true,
        points_earned: 10,
      };
      const { error } = await supabase
        .from("user_responses")
        .upsert([payload], { onConflict: "user_id,question_id" });
      if (error) throw error;
      toast.success("¡Misión completada!");
      setIsCompleted(true);
    } catch {
      toast.error("Error al guardar el progreso");
    } finally {
      setSubmitting(false);
    }
  }, [user, solvedCount, mission.id, question.id, supabase]);
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
            src="/backgrounds/mission/wall-mission-4.png"
            alt="Muro con apertura"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="w-full flex items-center justify-between max-w-6xl">
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-600 text-center max-w-xl leading-snug px-4">
            Ya alcanzaste la mitad de la travesía.
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
      <div className="absolute inset-0 -z-10 pointer-events-none bg-cover bg-center bg-no-repeat bg-[url('/bg-mobile-white.png')] lg:bg-[size:100%_100%] lg:bg-center lg:bg-[url('/backgrounds/mission/bg-mission-4.png')]" />
      <div className="flex flex-col w-full mx-auto px-4 py-2">
        <div className="flex flex-col justify-between w-full gap-5 mb-5">
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
                {mission.subtitle || "Kreuzworträtsel"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                {question?.question_text || "Completa el crucigrama"}
              </h1>
              <p className="text-sm text-slate-500">
                Responde las preguntas y completa el crucigrama
              </p>
            </div>
          </div>
          <div className="flex flex-col xl:flex-row gap-8 items-start w-full">
            <div className="py-2 flex flex-col items-center justify-center relative w-full xl:w-auto">
              <div className="relative inline-block p-2">
                <div
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${GRID_CONFIG.cols}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: GRID_CONFIG.rows }).map((_, r) =>
                    Array.from({ length: GRID_CONFIG.cols }).map((_, c) => {
                      const key = `${r}-${c}`;
                      const cellInfo = cellMap[key];
                      const isActive = Boolean(cellInfo?.length);

                      if (!isActive) {
                        return (
                          <div
                            key={key}
                            className="w-8 h-8 sm:w-9 sm:h-9 bg-transparent rounded-lg"
                          />
                        );
                      }
                      const startInfos = cellInfo.filter((i) => i.isStart);
                      const cellVal = gridState[key] || "";
                      const isCellInSolvedWord = cellInfo.some(
                        (i) => solvedWords[i.wordId],
                      );
                      return (
                        <div
                          key={key}
                          className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg border flex items-center justify-center bg-white shadow-sm transition-all ${
                            isCellInSolvedWord
                              ? "border-emerald-500 bg-emerald-50/40 text-emerald-700 font-bold"
                              : "border-blue-200 text-slate-800"
                          }`}
                        >
                          {startInfos.map((startInfo) => {
                            let positionClasses = "-top-2.5 -left-2.5";
                            if (startInfo.direction === "vertical")
                              positionClasses =
                                "-top-6 left-1/2 -translate-x-1/2";
                            else if (startInfo.direction === "horizontal")
                              positionClasses =
                                "top-1/2 -left-6 -translate-y-1/2";
                            else if (
                              startInfo.direction === "horizontal-inverted"
                            )
                              positionClasses =
                                "top-1/2 -right-6 -translate-y-1/2";

                            return (
                              <span
                                key={startInfo.wordId}
                                className={`absolute rounded-full bg-red-600 text-white font-extrabold flex items-center justify-center shadow-md z-20 pointer-events-none w-[18px] h-[18px] text-[10px] ${positionClasses}`}
                              >
                                {startInfo.wordId}
                              </span>
                            );
                          })}
                          <input
                            type="text"
                            maxLength={1}
                            value={cellVal}
                            onChange={(e) =>
                              handleCellChange(r, c, e.target.value)
                            }
                            className="w-full h-full text-center uppercase font-mono text-sm bg-transparent focus:outline-none z-0"
                          />
                        </div>
                      );
                    }),
                  )}
                </div>
                <div className="absolute -bottom-4 right-1 w-35 h-70 pointer-events-none z-20">
                  <Image
                    src="/mascot/otto-thinking.png"
                    alt="Ilustración de la misión"
                    fill
                    className="object-contain object-bottom"
                  />
                </div>
              </div>
            </div>
            <Card className="w-full xl:w-[420px] bg-white/95 backdrop-blur p-0 rounded-3xl shadow-xs shrink-0">
              <CardContent className="flex flex-col p-5 sm:p-6">
                <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Crucigrama
                </h3>
                <div className="flex flex-col max-h-[500px] overflow-y-auto pr-2">
                  {crosswordData.map((item) => {
                    const isWordSolved = solvedWords[item.id];
                    return (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3.5 p-2.5 rounded-2xl transition-colors ${
                          isWordSolved
                            ? "bg-emerald-50/60 border border-emerald-100"
                            : ""
                        }`}
                      >
                        <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          {item.id}
                        </span>
                        <p className="text-[11px] sm:text-xs text-slate-700 leading-relaxed font-medium">
                          {item.clue}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="w-full bg-[#FFFDF9] border-slate-200/80 rounded-2xl shadow-none py-0">
            <CardContent className="flex items-center justify-between p-3 sm:p-4 gap-2">
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-red-300 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 font-medium px-3 sm:px-5 text-sm shadow-none shrink-0"
              >
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Salir de la misión</span>
                  <span className="inline sm:hidden">Salir</span>
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-bold text-slate-700 hidden sm:inline">
                  Has encontrado{" "}
                  <span className="text-red-600">
                    {solvedCount} / {GRID_CONFIG.words.length}
                  </span>{" "}
                  palabras
                </span>
                <Button
                  onClick={handleSubmit}
                  size="lg"
                  disabled={
                    solvedCount < GRID_CONFIG.words.length || submitting
                  }
                  className="rounded-xl font-medium px-4 sm:px-6 text-sm transition-all flex items-center justify-center gap-2 shadow-none shrink-0 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  <span>
                    {submitting ? "Verificando..." : "Finalizar Misión"}
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
