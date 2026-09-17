"use client";

import { QuizViewProps, UserResponsePayload } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MascotCallout } from "@/components/shared/mascot-callout";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/client";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useState,
  useMemo,
  useEffect,
  useId,
  type CSSProperties,
  useCallback,
} from "react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { PuzzleResultDialog } from "./puzzle-result-dialog";

const supabase = createClient();

const COLS = 6;
const ROWS = 3;
const TOTAL_PIECES = COLS * ROWS;
const CELL = 100;
const BOARD_W = COLS * CELL;
const BOARD_H = ROWS * CELL;
const BLEED = 30;
const VIEW = CELL + BLEED * 2;

const PUZZLE_IMAGE = "/puzzle/full.jpg";

export interface PuzzlePieceOption {
  piece_id: number;
  target_slot: number;
}

const KNOB: [number, number][] = [
  [0.4, 0],
  [0.35, -0.12],
  [0.3, -0.28],
  [0.5, -0.28],
  [0.7, -0.28],
  [0.65, -0.12],
  [0.6, 0],
];

type Vec = [number, number];

function edgeToPath(start: Vec, dir: Vec, normal: Vec, sign: number): string {
  const at = (u: number, v: number): string => {
    const off = -v * sign * CELL;
    const x = start[0] + u * dir[0] + off * normal[0];
    const y = start[1] + u * dir[1] + off * normal[1];
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  };

  const end = at(1, 0);
  if (sign === 0) return `L ${end}`;

  const p = KNOB.map(([u, v]) => at(u, v));
  return `L ${p[0]} C ${p[1]} ${p[2]} ${p[3]} C ${p[4]} ${p[5]} ${p[6]} L ${end}`;
}

interface EdgeMap {
  v: number[][];
  h: number[][];
}

function buildEdges(): EdgeMap {
  const rnd = () => (Math.random() < 0.5 ? -1 : 1);
  const v = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS - 1 }, rnd),
  );
  const h = Array.from({ length: ROWS - 1 }, () =>
    Array.from({ length: COLS }, rnd),
  );
  return { v, h };
}

function piecePath(col: number, row: number, edges: EdgeMap): string {
  const top = row === 0 ? 0 : -edges.h[row - 1][col];
  const right = col === COLS - 1 ? 0 : edges.v[row][col];
  const bottom = row === ROWS - 1 ? 0 : edges.h[row][col];
  const left = col === 0 ? 0 : -edges.v[row][col - 1];

  return [
    `M 0,0`,
    edgeToPath([0, 0], [CELL, 0], [0, -1], top),
    edgeToPath([CELL, 0], [0, CELL], [1, 0], right),
    edgeToPath([CELL, CELL], [-CELL, 0], [0, 1], bottom),
    edgeToPath([0, CELL], [0, -CELL], [-1, 0], left),
    `Z`,
  ].join(" ");
}

function PuzzlePiece({
  slot,
  edges,
  image,
  className,
  style,
}: {
  slot: number;
  edges: EdgeMap;
  image: string;
  className?: string;
  style?: CSSProperties;
}) {
  const uid = useId();
  const col = slot % COLS;
  const row = Math.floor(slot / COLS);
  const d = useMemo(() => piecePath(col, row, edges), [col, row, edges]);
  const clipId = `clip-${uid}-${slot}`;

  return (
    <svg
      viewBox={`${-BLEED} ${-BLEED} ${VIEW} ${VIEW}`}
      className={cn("pointer-events-none select-none", className)}
      style={{ overflow: "visible", ...style }}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={d} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <image
          href={image}
          x={-col * CELL}
          y={-row * CELL}
          width={BOARD_W}
          height={BOARD_H}
          preserveAspectRatio="none"
        />
      </g>
      <path
        d={d}
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth={1.2}
      />
    </svg>
  );
}

function EmptySlot({
  slot,
  edges,
  highlight,
}: {
  slot: number;
  edges: EdgeMap;
  highlight?: boolean;
}) {
  const col = slot % COLS;
  const row = Math.floor(slot / COLS);
  const d = useMemo(() => piecePath(col, row, edges), [col, row, edges]);

  return (
    <svg
      viewBox={`${-BLEED} ${-BLEED} ${VIEW} ${VIEW}`}
      className="absolute pointer-events-none"
      style={{
        overflow: "visible",
        width: `${(VIEW / CELL) * 100}%`,
        height: `${(VIEW / CELL) * 100}%`,
        left: `${(-BLEED / CELL) * 100}%`,
        top: `${(-BLEED / CELL) * 100}%`,
      }}
    >
      <path
        d={d}
        fill="#ffffff"
        stroke={highlight ? "#2563eb" : "#e2e8f0"}
        strokeWidth={highlight ? 2 : 1}
      />
    </svg>
  );
}

export function PuzzleView({
  mission,
  questions,
  surveyQuestion,
}: QuizViewProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  const puzzleQuestion = useMemo(
    () => questions.find((q) => q.question_type === "puzzle") || questions[0],
    [questions],
  );

  const edges = useMemo(() => buildEdges(), []);
  const image = PUZZLE_IMAGE;

  const allPieces = useMemo<PuzzlePieceOption[]>(
    () =>
      Array.from({ length: TOTAL_PIECES }, (_, i) => ({
        piece_id: i,
        target_slot: i,
      })),
    [],
  );

  const [boardSlots, setBoardSlots] = useState<
    Record<number, PuzzlePieceOption | null>
  >({});
  const [availablePieces, setAvailablePieces] = useState<PuzzlePieceOption[]>(
    () => [...allPieces].sort(() => Math.random() - 0.5),
  );

  const [carouselIndex, setCarouselIndex] = useState(0);
  const visibleCarouselCount = 3;
  const [selected, setSelected] = useState<PuzzlePieceOption | null>(null);

  // Estados para encuesta y flujo final
  const [showResultModal, setShowResultModal] = useState(false);
  const [isSurveyPhase, setIsSurveyPhase] = useState(false);
  const [surveyText, setSurveyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const isPuzzleComplete = useMemo(() => {
    for (let i = 0; i < TOTAL_PIECES; i++) {
      const placed = boardSlots[i];
      if (!placed || placed.target_slot !== i) return false;
    }
    return true;
  }, [boardSlots]);

  // Opcional: abrir modal automáticamente al completar el 100% de las fichas
  useEffect(() => {
    if (
      isPuzzleComplete &&
      !isSurveyPhase &&
      !showResultModal &&
      !isCompleted
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowResultModal(true);
    }
  }, [isPuzzleComplete, isSurveyPhase, showResultModal, isCompleted]);

  const handlePlace = (slotIndex: number) => {
    if (selected) {
      const piece = selected;
      const existing = boardSlots[slotIndex] ?? null;
      setBoardSlots((prev) => ({ ...prev, [slotIndex]: piece }));
      setAvailablePieces((curr) => {
        const list = curr.filter((p) => p.piece_id !== piece.piece_id);
        return existing ? [...list, existing] : list;
      });
      setSelected(null);
      return;
    }
    const placed = boardSlots[slotIndex];
    if (placed) {
      setBoardSlots((prev) => ({ ...prev, [slotIndex]: null }));
      setAvailablePieces((curr) => [...curr, placed]);
    }
  };

  const moveCarousel = (direction: "up" | "down") => {
    setCarouselIndex((prev) =>
      direction === "up"
        ? Math.max(0, prev - 1)
        : Math.max(
            0,
            Math.min(
              Math.max(0, availablePieces.length - visibleCarouselCount),
              prev + 1,
            ),
          ),
    );
  };

  const handleFinalSubmit = useCallback(async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para guardar tu progreso");
      return;
    }
    try {
      setSubmitting(true);
      const responsesToInsert: UserResponsePayload[] = [
        {
          user_id: user.id,
          mission_id: mission.id,
          question_id: puzzleQuestion?.id || "puzzle-completion",
          selected_option: "completed_18_independent_pieces",
          is_correct: true,
          points_earned: 10,
        },
      ];

      if (surveyQuestion && surveyText.trim()) {
        responsesToInsert.push({
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
        .upsert(responsesToInsert, { onConflict: "user_id,question_id" });
      if (error) throw error;

      toast.success("¡Misión completada con éxito!");
      setIsCompleted(true);
      setShowResultModal(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al guardar";
      toast.error("Error al completar", { description: message });
    } finally {
      setSubmitting(false);
    }
  }, [user, mission.id, puzzleQuestion, surveyQuestion, surveyText]);

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-between !p-0 relative overflow-hidden py-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Misión {mission.week_number}: ¡Completada!
        </h1>
        <div className="relative w-full max-w-2xl aspect-[2/1] rounded-3xl overflow-hidden shadow-xl border-4 border-blue-600 bg-white my-4">
          <img
            src="/backgrounds/mission/wall-mission-7.png"
            alt="Imagen del rompecabezas"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full flex items-center justify-between max-w-6xl gap-4 p-4">
          <p className="text-lg sm:text-xl font-bold text-blue-600 text-center flex-1">
            Una última misión nos separa de la reunificación.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl px-6 py-3 shadow-md flex items-center gap-2"
          >
            <span>Continuar</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  const visibleTrayItems = availablePieces.slice(
    carouselIndex,
    carouselIndex + visibleCarouselCount,
  );

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto px-4 py-2">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4">
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
          <div className="flex items-center gap-2 text-sm font-bold flex-wrap">
            <span className="text-blue-600">
              {isSurveyPhase
                ? "Encuesta Final"
                : `Misión ${mission.week_number}`}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400 font-normal">
              {isSurveyPhase ? "Feedback" : "Puzzle"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {isSurveyPhase
              ? "¡Rompecabezas completado!"
              : puzzleQuestion?.question_text || "Completa el rompecabezas"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {isSurveyPhase
              ? surveyQuestion?.question_text || "Compártenos tu comentario"
              : "Descubre lo que oculta nuestro puzzle colocando cada ficha en su sitio."}
          </p>
        </div>
      </div>

      {/* Contenido principal (Puzzle o Survey) */}
      {!isSurveyPhase ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] items-center gap-6 w-full">
          {/* Tablero */}
          <div className="bg-white p-2 rounded-2xl border-4 border-blue-600 shadow-sm w-full">
            <div
              className="grid w-full aspect-[2/1]"
              style={{
                gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: TOTAL_PIECES }).map((_, slotIndex) => {
                const placedPiece = boardSlots[slotIndex];
                return (
                  <div
                    key={slotIndex}
                    onClick={() => handlePlace(slotIndex)}
                    className="relative cursor-pointer"
                    style={{ zIndex: placedPiece ? 1 : 0 }}
                  >
                    {placedPiece ? (
                      <PuzzlePiece
                        slot={placedPiece.target_slot}
                        edges={edges}
                        image={image}
                        className="absolute"
                        style={{
                          width: `${(VIEW / CELL) * 100}%`,
                          height: `${(VIEW / CELL) * 100}%`,
                          left: `${(-BLEED / CELL) * 100}%`,
                          top: `${(-BLEED / CELL) * 100}%`,
                        }}
                      />
                    ) : (
                      <EmptySlot
                        slot={slotIndex}
                        edges={edges}
                        highlight={!!selected}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bandeja vertical */}
          <div className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl p-3 shadow-sm h-full gap-2 min-w-[110px]">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => moveCarousel("up")}
              disabled={carouselIndex === 0}
              className="rounded-full h-8 w-8 text-slate-600 hover:bg-slate-100"
            >
              <ChevronUp className="w-5 h-5" />
            </Button>

            <div className="flex flex-col gap-4 min-h-[220px] justify-center items-center w-full py-1">
              {visibleTrayItems.map((piece) => {
                const isSelected = selected?.piece_id === piece.piece_id;
                return (
                  <div
                    key={piece.piece_id}
                    onClick={() => setSelected(piece)}
                    className={cn(
                      "w-20 h-20 cursor-pointer transition-transform rounded-lg",
                      isSelected
                        ? "scale-110 ring-2 ring-blue-600/40"
                        : "hover:scale-105",
                    )}
                  >
                    <PuzzlePiece
                      slot={piece.target_slot}
                      edges={edges}
                      image={image}
                      className="w-full h-full drop-shadow-sm"
                    />
                  </div>
                );
              })}
              {availablePieces.length === 0 && (
                <p className="text-xs text-slate-400 text-center w-20 py-4">
                  ¡Vacío!
                </p>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => moveCarousel("down")}
              disabled={
                carouselIndex >= availablePieces.length - visibleCarouselCount
              }
              className="rounded-full h-8 w-8 text-slate-600 hover:bg-slate-100"
            >
              <ChevronDown className="w-5 h-5" />
            </Button>
            <span className="text-[10px] text-slate-400 font-medium">
              Restantes: {availablePieces.length}
            </span>
          </div>

          {/* Mascota Otto */}
          <MascotCallout
            imageSrc="/mascot/otto-puzzle.png"
            message={
              <>
                Completa el{" "}
                <span className="text-blue-600 block">rompecabezas</span>
              </>
            }
            orientation="vertical"
            className="!w-fit self-center justify-self-center [&>div:last-child]:!w-[220px] [&>div:last-child]:!h-[320px]"
          />
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
            imageSrc="/mascot/otto-cards-survey.png"
            message={
              <>
                Compártenos{" "}
                <span className="text-red-600 block">tu respuesta</span>
              </>
            }
            orientation="vertical"
            className="!w-fit self-center justify-self-center [&>div:first-child]:!text-xs [&>div:first-child]:!translate-x-8 [&>div:last-child]:!w-[260px] [&>div:last-child]:!h-[320px]"
          />
        </div>
      )}

      {/* Acciones inferiores */}
      <Card className="w-full bg-[#FFFDF9] border-slate-200/80 rounded-2xl shadow-none py-0 mt-6">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 gap-3">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full border-red-300 bg-white text-red-600 hover:bg-red-50 font-medium px-4 text-sm shadow-none shrink-0"
          >
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Salir de la misión</span>
            </Link>
          </Button>

          {!isSurveyPhase ? (
            <Button
              onClick={() => {
                if (!isPuzzleComplete) {
                  toast.info("Cada ficha debe estar en su posición exacta.");
                  return;
                }
                setShowResultModal(true);
              }}
              disabled={!isPuzzleComplete || submitting}
              size="lg"
              className={cn(
                "rounded-xl font-medium px-6 text-sm transition-all flex items-center gap-2",
                isPuzzleComplete
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed",
              )}
            >
              <span>Ver Resultado</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleFinalSubmit}
              disabled={!surveyText.trim() || submitting}
              size="lg"
              className="rounded-xl font-medium px-6 bg-red-600 hover:bg-red-700 text-white shadow-none text-sm shrink-0 flex items-center gap-2"
            >
              <span>{submitting ? "Guardando..." : "Finalizar misión"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </CardContent>
      </Card>

      <PuzzleResultDialog
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
  );
}
