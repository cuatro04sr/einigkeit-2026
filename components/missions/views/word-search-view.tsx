"use client";

import { CrosswordResultDialog } from "@/components/missions/views/crossword-result-dialog";
import { MascotCallout } from "@/components/shared/mascot-callout";
import { QuizViewProps, UserResponsePayload } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/client";

import { ArrowLeft, ArrowRight, CheckCircle2, Search } from "lucide-react";
import { useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import Link from "next/link";
import { WordResultDialog } from "./word-result-dialog";

type WordDirection =
  | "horizontal"
  | "horizontal-reverse"
  | "vertical"
  | "vertical-reverse"
  | "diagonal-down-right"
  | "diagonal-up-right"
  | "diagonal-down-left"
  | "diagonal-up-left";

const DIRECTION_VECTORS: Record<WordDirection, [number, number]> = {
  horizontal: [0, 1],
  "horizontal-reverse": [0, -1],
  vertical: [1, 0],
  "vertical-reverse": [-1, 0],
  "diagonal-down-right": [1, 1],
  "diagonal-up-right": [-1, 1],
  "diagonal-down-left": [1, -1],
  "diagonal-up-left": [-1, -1],
};

interface WordSearchWord {
  id: number;
  word: string;
  startRow: number;
  startCol: number;
  direction: WordDirection;
}

const LETTER_GRID: string[] = [
  "KSAXOHFLTOARINE",
  "LAPRTOSTERHASEC",
  "FERAEHERFHNTLPT",
  "TLUTARLTNTMAAQA",
  "MLMAOBUEKUPLTHN",
  "REONUFLNHRNOELN",
  "BHBLMKFSKRTBRNE",
  "TRTRUOUEHOEUNPN",
  "OERHMAWMLTBREUB",
  "LRUMLDTORSKLROA",
  "MIAOCRMLNLANERU",
  "BNKUESXBRNULOTM",
  "AIMLYORUOMTMAEL",
  "NAREIERETSONLTO",
];

const GRID_CONFIG = {
  rows: LETTER_GRID.length,
  cols: LETTER_GRID[0].length,
  words: [
    {
      id: 1,
      word: "KARTOFFELSALAT",
      startRow: 0,
      startCol: 0,
      direction: "diagonal-down-right",
    },
    {
      id: 2,
      word: "LATERNE",
      startRow: 2,
      startCol: 12,
      direction: "vertical",
    },
    {
      id: 3,
      word: "NIKOLAUS",
      startRow: 13,
      startCol: 0,
      direction: "diagonal-up-right",
    },
    {
      id: 4,
      word: "OSTERHASE",
      startRow: 1,
      startCol: 5,
      direction: "horizontal",
    },
    {
      id: 5,
      word: "OSTEREIER",
      startRow: 13,
      startCol: 10,
      direction: "horizontal-reverse",
    },
    {
      id: 6,
      word: "TANNENBAUM",
      startRow: 2,
      startCol: 14,
      direction: "vertical",
    },
    {
      id: 7,
      word: "LEHRER",
      startRow: 3,
      startCol: 6,
      direction: "diagonal-down-right",
    },
    {
      id: 8,
      word: "LEHRERIN",
      startRow: 4,
      startCol: 1,
      direction: "vertical",
    },
  ] as WordSearchWord[],
};

type Cell = { r: number; c: number };

function cellKey(r: number, c: number) {
  return `${r}-${c}`;
}

function getWordCells(w: WordSearchWord): Cell[] {
  const [dr, dc] = DIRECTION_VECTORS[w.direction];
  return Array.from({ length: w.word.length }, (_, i) => ({
    r: w.startRow + dr * i,
    c: w.startCol + dc * i,
  }));
}

function getLinePath(start: Cell, end: Cell): Cell[] | null {
  const dRow = end.r - start.r;
  const dCol = end.c - start.c;
  if (dRow === 0 && dCol === 0) return [start];
  const isHorizontal = dRow === 0;
  const isVertical = dCol === 0;
  const isDiagonal = Math.abs(dRow) === Math.abs(dCol);
  if (!isHorizontal && !isVertical && !isDiagonal) return null;
  const steps = Math.max(Math.abs(dRow), Math.abs(dCol));
  const stepR = Math.sign(dRow);
  const stepC = Math.sign(dCol);
  const path: Cell[] = [];
  for (let i = 0; i <= steps; i++) {
    path.push({ r: start.r + stepR * i, c: start.c + stepC * i });
  }
  return path;
}

function pathToWord(path: Cell[]): string {
  return path.map(({ r, c }) => LETTER_GRID[r]?.[c] ?? "").join("");
}

function toTitleCase(word: string): string {
  return word.charAt(0) + word.slice(1).toLowerCase();
}

function lineEndpoints(cells: Cell[]): {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
} {
  const first = cells[0];
  const last = cells[cells.length - 1];
  return {
    x1: first.c + 0.5,
    y1: first.r + 0.5,
    x2: last.c + 0.5,
    y2: last.r + 0.5,
  };
}

export function WordSearchView({
  mission,
  questions,
  surveyQuestion,
}: QuizViewProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const supabase = useMemo(() => createClient(), []);
  const question = useMemo(
    () => (Array.isArray(questions) ? questions[0] : questions),
    [questions],
  );

  const [foundWordIds, setFoundWordIds] = useState<Record<number, boolean>>({});
  const [selecting, setSelecting] = useState(false);
  const [startCell, setStartCell] = useState<Cell | null>(null);
  const [currentCell, setCurrentCell] = useState<Cell | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isSurveyPhase, setIsSurveyPhase] = useState(false);
  const [surveyText, setSurveyText] = useState("");

  const gridRef = useRef<HTMLDivElement>(null);

  const totalWords = GRID_CONFIG.words.length;
  const solvedCount = Object.values(foundWordIds).filter(Boolean).length;
  const allFound = solvedCount === totalWords;

  const selectedPath = useMemo(() => {
    if (!selecting || !startCell || !currentCell) return [];
    return getLinePath(startCell, currentCell) ?? [];
  }, [selecting, startCell, currentCell]);

  const resolveCellFromPoint = useCallback(
    (x: number, y: number): Cell | null => {
      const el = document.elementFromPoint(x, y) as HTMLElement | null;
      const target = el?.closest("[data-row][data-col]") as HTMLElement | null;
      if (!target) return null;
      const r = Number(target.dataset.row);
      const c = Number(target.dataset.col);
      if (Number.isNaN(r) || Number.isNaN(c)) return null;
      return { r, c };
    },
    [],
  );

  const finalizeSelection = useCallback(() => {
    if (!startCell || !currentCell) {
      setSelecting(false);
      setStartCell(null);
      setCurrentCell(null);
      return;
    }
    const path = getLinePath(startCell, currentCell);
    if (path && path.length > 1) {
      const forward = pathToWord(path);
      const backward = forward.split("").reverse().join("");
      const match = GRID_CONFIG.words.find(
        (w) =>
          !foundWordIds[w.id] && (w.word === forward || w.word === backward),
      );
      if (match) {
        setFoundWordIds((prev) => ({ ...prev, [match.id]: true }));
        toast.success(`¡Encontraste "${match.word}"!`);
      }
    }
    setSelecting(false);
    setStartCell(null);
    setCurrentCell(null);
  }, [startCell, currentCell, foundWordIds]);

  const handlePointerDown = useCallback(
    (r: number, c: number) => (e: React.PointerEvent) => {
      e.preventDefault();
      gridRef.current?.setPointerCapture(e.pointerId);
      setSelecting(true);
      setStartCell({ r, c });
      setCurrentCell({ r, c });
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!selecting) return;
      const cell = resolveCellFromPoint(e.clientX, e.clientY);
      if (cell) setCurrentCell(cell);
    },
    [selecting, resolveCellFromPoint],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (gridRef.current?.hasPointerCapture(e.pointerId)) {
        gridRef.current.releasePointerCapture(e.pointerId);
      }
      finalizeSelection();
    },
    [finalizeSelection],
  );

  const handleCheckCompletion = useCallback(() => {
    if (!user) {
      toast.error("Inicia sesión para guardar tu progreso");
      return;
    }
    if (!allFound) {
      toast.error("Aún faltan palabras por encontrar.");
      return;
    }
    setShowResultModal(true);
  }, [user, allFound]);

  const handleFinalSubmit = useCallback(async () => {
    if (!user) {
      toast.error("Inicia sesión para guardar tu progreso");
      return;
    }
    try {
      setSubmitting(true);
      const responses: UserResponsePayload[] = [
        {
          user_id: user.id,
          mission_id: mission.id,
          question_id: question?.id,
          selected_option: "completed",
          is_correct: true,
          points_earned: 10,
        },
      ];
      if (surveyQuestion && surveyText.trim()) {
        responses.push({
          user_id: user.id,
          mission_id: mission.id,
          question_id: surveyQuestion.id,
          selected_option: "text_response",
          text_answer: surveyText.trim(),
          is_correct: null,
          points_earned: 0,
        });
      }
      const { error } = await supabase
        .from("user_responses")
        .upsert(responses, { onConflict: "user_id,question_id" });
      if (error) throw error;
      toast.success("¡Misión completada!");
      setIsCompleted(true);
      setShowResultModal(false);
    } catch {
      toast.error("Error al guardar el progreso");
    } finally {
      setSubmitting(false);
    }
  }, [user, mission.id, question, supabase, surveyQuestion, surveyText]);

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-between min-h-[60vh] py-8 text-center relative overflow-hidden">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Misión Finalizada
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Misión {mission.week_number}: Completada
          </h1>
        </div>
        <div className="relative w-full max-w-xl aspect-video my-4">
          <Image
            src="/backgrounds/mission/wall-mission-8.png"
            alt="Muro con apertura"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="w-full flex flex-col sm:flex-row items-center justify-between max-w-4xl gap-4 bg-white/80 backdrop-blur p-6 rounded-3xl">
          <p className="text-base sm:text-lg font-bold text-red-600 text-center sm:text-left max-w-xl leading-snug">
            Cada recuerdo derribó un bloque. Cada conexión reconstruyó nuestra
            comunidad.
          </p>
          <Button
            onClick={() => router.push("/certificado")}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-2xl px-6 py-3 shadow-md hover:shadow-lg transition-all flex items-center gap-2 shrink-0"
          >
            <span>Ver mi certificado</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="absolute inset-0 -z-10 pointer-events-none bg-cover bg-center bg-no-repeat bg-[url('/bg-mobile-white.png')] lg:bg-[size:100%_100%] lg:bg-center lg:bg-[url('/backgrounds/mission/bg-mission-8.png')]" />
      <div className="flex flex-col w-full mx-auto px-4 py-2 max-w-7xl">
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
                {isSurveyPhase
                  ? "Encuesta Final"
                  : `Misión ${mission.week_number}`}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400 font-normal">
                {isSurveyPhase ? "Feedback" : mission.subtitle || "Wortsuche"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-md sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight leading-tight">
                {isSurveyPhase
                  ? "Ahora que completaste la sopa de letras"
                  : "Sopa de letras"}
              </h1>
              <p className="text-sm text-slate-500">
                {isSurveyPhase
                  ? "Cuéntanos, " + surveyQuestion?.question_text ||
                    "Compártenos tu comentario"
                  : `Completa la sopa de letras y encuentra las ${totalWords} palabras ocultas.`}
              </p>
            </div>
          </div>

          {!isSurveyPhase ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center w-full">
              <div className="xl:col-span-7 py-2 flex items-center justify-center w-full">
                <div className="relative inline-block p-2 border-4 border-blue-600 rounded-2xl bg-white shadow-sm">
                  <svg
                    viewBox={`0 0 ${GRID_CONFIG.cols} ${GRID_CONFIG.rows}`}
                    preserveAspectRatio="none"
                    className="absolute inset-2 w-[calc(100%-1rem)] h-[calc(100%-1rem)] pointer-events-none z-0"
                  >
                    {GRID_CONFIG.words
                      .filter((w) => foundWordIds[w.id])
                      .map((w) => {
                        const { x1, y1, x2, y2 } = lineEndpoints(
                          getWordCells(w),
                        );
                        return (
                          <line
                            key={w.id}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="#2563eb"
                            strokeOpacity={0.32}
                            strokeWidth={0.82}
                            strokeLinecap="round"
                          />
                        );
                      })}
                    {selecting &&
                      selectedPath.length > 1 &&
                      (() => {
                        const { x1, y1, x2, y2 } = lineEndpoints(selectedPath);
                        return (
                          <line
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="#2563eb"
                            strokeOpacity={0.5}
                            strokeWidth={0.82}
                            strokeLinecap="round"
                          />
                        );
                      })()}
                  </svg>
                  <div
                    ref={gridRef}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    className="relative z-10 grid touch-none select-none"
                    style={{
                      gridTemplateColumns: `repeat(${GRID_CONFIG.cols}, minmax(0, 1fr))`,
                    }}
                  >
                    {LETTER_GRID.map((rowStr, r) =>
                      rowStr.split("").map((letter, c) => {
                        const key = cellKey(r, c);
                        return (
                          <div
                            key={key}
                            data-row={r}
                            data-col={c}
                            onPointerDown={handlePointerDown(r, c)}
                            className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center cursor-pointer font-mono text-sm uppercase text-slate-800"
                          >
                            {letter}
                          </div>
                        );
                      }),
                    )}
                  </div>
                </div>
              </div>

              <div className="xl:col-span-2 flex flex-col self-start items-center justify-center bg-white rounded-2xl shadow-sm gap-3 py-4">
                {GRID_CONFIG.words.map((w) => {
                  const isWordFound = foundWordIds[w.id];
                  return (
                    <p
                      key={w.id}
                      className={`text-sm sm:text-base font-semibold tracking-wide text-center transition-colors ${
                        isWordFound ? "text-emerald-600" : "text-slate-700"
                      }`}
                    >
                      {toTitleCase(w.word)}
                    </p>
                  );
                })}
              </div>

              <div className="xl:col-span-3 self-end relative hidden lg:flex items-end justify-center h-100">
                <Image
                  src="/mascot/otto-word.png"
                  alt="Ilustración de la misión"
                  fill
                  className="object-contain object-bottom"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-start gap-4 w-full">
              <Textarea
                placeholder="Escribe aquí tu respuesta..."
                value={surveyText}
                onChange={(e) => setSurveyText(e.target.value)}
                className="w-full flex-1 h-full min-h-[250px] p-4 rounded-2xl border-slate-200 bg-white focus:border-red-600 focus:ring-0 resize-none shadow-sm"
              />
              <MascotCallout
                imageSrc="/mascot/otto-crossword-survey.png"
                message={
                  <>
                    Compártenos{" "}
                    <span className="text-red-600 block">tu respuesta</span>
                  </>
                }
                orientation="vertical"
                className="!w-fit self-center justify-self-center [&>div:first-child]:!text-xs [&>div:first-child]:!translate-x-2 [&>div:last-child]:!w-[350px] [&>div:last-child]:!h-[400px]"
              />
            </div>
          )}

          <Card className="w-full bg-[#FFFDF9] border-slate-200/80 rounded-2xl shadow-xs py-0">
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
                {!isSurveyPhase && (
                  <span className="text-xs sm:text-sm font-bold text-slate-700 hidden sm:inline">
                    Has encontrado{" "}
                    <span className="text-red-600 font-extrabold">
                      {solvedCount} / {totalWords}
                    </span>{" "}
                    palabras
                  </span>
                )}
                {!isSurveyPhase ? (
                  <Button
                    onClick={handleCheckCompletion}
                    size="lg"
                    disabled={!allFound}
                    className="rounded-xl font-medium px-4 sm:px-6 text-sm transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  >
                    <span>Finalizar Misión</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleFinalSubmit}
                    disabled={!surveyText.trim() || submitting}
                    size="lg"
                    className="rounded-xl font-medium px-4 sm:px-6 bg-red-600 hover:bg-red-700 text-white shadow-none text-sm shrink-0 flex items-center gap-2"
                  >
                    <span>
                      {submitting ? "Guardando..." : "Finalizar misión"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          <WordResultDialog
            open={showResultModal}
            onOpenChange={setShowResultModal}
            isSuccess={true}
            onContinue={() => {
              setShowResultModal(false);
              if (surveyQuestion) {
                setIsSurveyPhase(true);
              } else {
                handleFinalSubmit();
              }
            }}
            submitting={submitting}
          />
        </div>
      </div>
    </>
  );
}
