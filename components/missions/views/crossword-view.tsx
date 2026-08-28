"use client";

import {
  ArrowLeft,
  ArrowRight,
  Trophy,
  Upload,
  X,
  CheckCircle2,
} from "lucide-react";
import { useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import Link from "next/link";

import { CrosswordResultDialog } from "@/components/missions/views/crossword-result-dialog";
import { CrosswordOption, QuizViewProps, UserResponsePayload } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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

export function CrosswordView({
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
  const crosswordData = useMemo(() => {
    if (!question?.options) return [];
    return (question.options as unknown as CrosswordOption[]) || [];
  }, [question]);
  const [gridState, setGridState] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSurveyPhase, setIsSurveyPhase] = useState(false);
  const [surveyText, setSurveyText] = useState("");
  const [showResultModal, setShowResultModal] = useState(false);
  const [surveyImageFile, setSurveyImageFile] = useState<File | null>(null);
  const [surveyImagePreview, setSurveyImagePreview] = useState<string | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar los 5MB");
      return;
    }
    setSurveyImageFile(file);
    setSurveyImagePreview(URL.createObjectURL(file));
  };
  const handleRemoveImage = () => {
    setSurveyImageFile(null);
    if (surveyImagePreview) {
      URL.revokeObjectURL(surveyImagePreview);
      setSurveyImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
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
  const handleCheckCompletion = useCallback(() => {
    if (!user) {
      toast.error("Inicia sesión para guardar tu progreso");
      return;
    }
    if (solvedCount < GRID_CONFIG.words.length) {
      toast.error("Aún hay respuestas incorrectas o incompletas.");
      return;
    }
    setShowResultModal(true);
  }, [user, solvedCount]);
  const handleFinalSubmit = useCallback(async () => {
    if (!user) {
      toast.error("Inicia sesión para guardar tu progreso");
      return;
    }
    try {
      setSubmitting(true);
      let imageUrl: string | null = null;
      if (surveyImageFile) {
        const fileExt = surveyImageFile.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `mission-surveys/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("missions")
          .upload(filePath, surveyImageFile);
        if (uploadError) throw new Error("Error al subir la imagen");
        const { data: publicUrlData } = supabase.storage
          .from("missions")
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }
      const responses: UserResponsePayload[] = [
        {
          user_id: user.id,
          mission_id: mission.id,
          question_id: question.id,
          selected_option: "completed",
          is_correct: true,
          points_earned: 10,
        },
      ];
      if (surveyQuestion && (surveyText.trim() || imageUrl)) {
        responses.push({
          user_id: user.id,
          mission_id: mission.id,
          question_id: surveyQuestion?.id || null,
          selected_option: imageUrl,
          text_answer: surveyText.trim(),
          is_correct: null,
          status: "pending",
          points_earned: 0,
        } as unknown as UserResponsePayload);
      }
      const { error } = await supabase
        .from("user_responses")
        .upsert(responses, { onConflict: "user_id,question_id" });
      if (error) throw error;
      toast.success("¡Misión completada!");
      setIsCompleted(true);
    } catch (e) {
      toast.error("Error al guardar el progreso");
    } finally {
      setSubmitting(false);
    }
  }, [
    user,
    mission.id,
    question.id,
    surveyQuestion,
    surveyText,
    surveyImageFile,
    supabase,
  ]);
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
            src="/backgrounds/mission/wall-mission-4.png"
            alt="Muro con apertura"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="w-full flex flex-col sm:flex-row items-center justify-between max-w-4xl gap-4 bg-white/80 backdrop-blur p-6 rounded-3xl">
          <p className="text-base sm:text-lg font-bold text-red-600 text-center sm:text-left max-w-xl leading-snug">
            Ya alcanzaste la mitad de la travesía. ¡Excelente trabajo!
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
                {mission.subtitle || "Kreuzworträtsel"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                {isSurveyPhase
                  ? "¡Crucigrama completado con éxito!"
                  : question?.question_text || "Completa el crucigrama"}
              </h1>
              <p className="text-sm text-slate-500">
                {isSurveyPhase
                  ? surveyQuestion?.question_text ||
                    "¿Cuál de todas las celebraciones de tu época escolar esperabas con más emoción? ¿Tienes una foto?"
                  : "Responde las pistas y rellena las casillas del crucigrama"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start w-full">
            {!isSurveyPhase ? (
              <>
                <div className="xl:col-span-8 py-2 flex flex-col items-center justify-center relative w-full">
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
                    <div className="absolute -bottom-6 -right-16 w-44 h-80 pointer-events-none z-20 hidden xl:block">
                      <Image
                        src="/mascot/otto-thinking.png"
                        alt="Ilustración de la misión"
                        fill
                        className="object-contain object-bottom"
                      />
                    </div>
                  </div>
                </div>
                <Card className="xl:col-span-4 w-full bg-white/95 backdrop-blur p-0 rounded-3xl shadow-sm border-slate-100 shrink-0">
                  <CardContent className="flex flex-col p-5 sm:p-6">
                    <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                      Pistas del Crucigrama
                    </h3>
                    <div className="flex flex-col max-h-[500px] overflow-y-auto pr-2 mt-3 space-y-2">
                      {crosswordData.map((item) => {
                        const isWordSolved = solvedWords[item.id];
                        return (
                          <div
                            key={item.id}
                            className={`flex items-start gap-3.5 p-3 rounded-2xl transition-all ${
                              isWordSolved
                                ? "bg-emerald-50/80 border border-emerald-100 shadow-xs"
                                : "hover:bg-slate-50/80 border border-transparent"
                            }`}
                          >
                            <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                              {item.id}
                            </span>
                            <p className="text-xs text-slate-700 leading-relaxed font-medium">
                              {item.clue}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="col-span-8 grid grid-cols-1 lg:grid-cols-8 gap-6 w-full items-start relative bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl">
                <div className="lg:col-span-4 flex flex-col gap-3">
                  <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Tu respuesta o anécdota</span>
                    <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full font-semibold">
                      Obligatorio
                    </span>
                  </label>
                  <Textarea
                    placeholder="Escribe aquí tu recuerdo, experiencia o comentario sobre la misión... *"
                    value={surveyText}
                    onChange={(e) => setSurveyText(e.target.value)}
                    className="w-full min-h-[220px] p-4 rounded-2xl border-slate-200 bg-white/90 focus:border-red-600 focus:ring-1 focus:ring-red-600 resize-none shadow-xs text-slate-800 text-sm leading-relaxed"
                  />
                </div>
                <div className="lg:col-span-4 flex flex-col gap-3">
                  <label className="text-sm font-bold text-slate-900 flex items-center justify-between">
                    <span>Evidencia fotográfica</span>
                    <span className="text-xs font-normal text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                      Opcional
                    </span>
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                  />
                  {surveyImagePreview ? (
                    <div className="relative w-full h-[220px] rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shadow-inner group">
                      <Image
                        src={surveyImagePreview}
                        alt="Vista previa de la encuesta"
                        fill
                        className="object-contain"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={handleRemoveImage}
                          type="button"
                          className="bg-red-600 text-white rounded-full p-2 shadow-lg hover:bg-red-700 transition-transform hover:scale-105"
                          title="Eliminar imagen"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-[220px] flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-sky-200 bg-gradient-to-b from-sky-50/40 to-white hover:from-sky-50 hover:to-sky-50/80 cursor-pointer transition-all p-6 text-center shadow-xs group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-slate-800">
                          Haz clic para adjuntar imagen o arrástrala aquí
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          PNG, JPG o WEBP (máx. 5MB)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-0 -right-96 w-72 h-[480px] sm:w-80 sm:h-[540px] pointer-events-none shrink-0 hidden xl:block z-20">
                  <Image
                    src="/mascot/otto-crossword-survey.png"
                    alt="Mascota Otto"
                    fill
                    className="object-contain object-bottom drop-shadow-md"
                  />
                </div>
              </div>
            )}
          </div>
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
                      {solvedCount} / {GRID_CONFIG.words.length}
                    </span>{" "}
                    palabras
                  </span>
                )}
                {!isSurveyPhase ? (
                  <Button
                    onClick={handleCheckCompletion}
                    size="lg"
                    disabled={solvedCount < GRID_CONFIG.words.length}
                    className="rounded-xl font-medium px-4 sm:px-6 text-sm transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  >
                    <span>Finalizar Misión</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleFinalSubmit}
                    size="lg"
                    disabled={!surveyText.trim() || submitting}
                    className="rounded-xl font-medium px-4 sm:px-6 text-sm transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                  >
                    <span>
                      {submitting ? "Guardando..." : "Finalizar misión"}
                    </span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          <CrosswordResultDialog
            open={showResultModal}
            onOpenChange={setShowResultModal}
            isSuccess={true}
            earnedPoints={10}
            onRetry={() => {}}
            onContinue={
              surveyQuestion
                ? () => {
                    setShowResultModal(false);
                    setIsSurveyPhase(true);
                  }
                : handleFinalSubmit
            }
            submitting={submitting}
          />
        </div>
      </div>
    </>
  );
}
