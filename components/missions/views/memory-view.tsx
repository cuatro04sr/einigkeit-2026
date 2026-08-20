"use client";

import { ArrowLeft, ArrowRight, Clock, Trophy } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { MemoryResultDialog } from "@/components/missions/views/memory-result-dialog";
import { MascotCallout } from "@/components/shared/mascot-callout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/client";
import { cn } from "@/lib/utils";
import {
  UserResponsePayload,
  QuizViewProps,
  MemoryCard,
  RawPair,
} from "@/types";

const supabase = createClient();
const CARD_BACK_IMAGE = "/missions/m3/card.png";
const TIMER_INITIAL_SECONDS = 180;

function shuffleCards(rawPairs: RawPair[]): MemoryCard[] {
  const deck: MemoryCard[] = [];
  rawPairs.forEach((pair) => {
    deck.push(
      {
        uniqueId: `${pair.id}-img`,
        pairId: pair.id,
        type: "image",
        content: pair.image,
      },
      {
        uniqueId: `${pair.id}-txt`,
        pairId: pair.id,
        type: "text",
        content: pair.text,
      },
    );
  });
  return deck.sort(() => Math.random() - 0.5);
}

export function MemoryView({
  mission,
  questions,
  surveyQuestion,
}: QuizViewProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const memoryQuestion = useMemo(
    () => (Array.isArray(questions) ? questions[0] : questions),
    [questions],
  );
  const [cards, setCards] = useState<MemoryCard[]>(() => {
    if (!memoryQuestion?.options) return [];
    return shuffleCards(memoryQuestion.options as unknown as RawPair[]);
  });
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_INITIAL_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isTimeOut, setIsTimeOut] = useState(false);
  const [isSurveyPhase, setIsSurveyPhase] = useState(false);
  const [surveyText, setSurveyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const handleRetry = useCallback(() => {
    if (memoryQuestion?.options) {
      setCards(shuffleCards(memoryQuestion.options as unknown as RawPair[]));
    }
    setFlippedIndices([]);
    setMatchedPairs([]);
    setIsChecking(false);
    setTimeLeft(TIMER_INITIAL_SECONDS);
    setIsTimerRunning(true);
    setIsTimeOut(false);
    setShowResultModal(false);
  }, [memoryQuestion]);
  const handleFinalSubmit = useCallback(async () => {
    if (!user) return toast.error("Inicia sesión para guardar tu progreso");
    try {
      setSubmitting(true);
      const responses: UserResponsePayload[] = [
        {
          user_id: user.id,
          mission_id: mission.id,
          question_id: memoryQuestion.id,
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
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSubmitting(false);
    }
  }, [user, mission.id, memoryQuestion, surveyQuestion, surveyText]);
  useEffect(() => {
    if (!isTimerRunning || isCompleted || isSurveyPhase) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimerRunning(false);
          setIsTimeOut(true);
          setShowResultModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning, isCompleted, isSurveyPhase]);
  const handleCardClick = (index: number) => {
    if (
      isChecking ||
      flippedIndices.includes(index) ||
      matchedPairs.includes(cards[index].pairId) ||
      !isTimerRunning
    )
      return;
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);
    if (newFlipped.length === 2) {
      setIsChecking(true);
      const [first, second] = newFlipped;
      if (cards[first].pairId === cards[second].pairId) {
        const updated = [...matchedPairs, cards[first].pairId];
        setMatchedPairs(updated);
        setFlippedIndices([]);
        setIsChecking(false);
        if (updated.length === cards.length / 2) {
          setIsTimerRunning(false);
          setShowResultModal(true);
        }
      } else {
        setTimeout(() => {
          setFlippedIndices([]);
          setIsChecking(false);
        }, 600);
      }
    }
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-between !p-0 relative overflow-hidden">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Misión {mission.week_number}: Completada
        </h1>
        <div className="relative w-full max-w-2xl aspect-video my-4">
          <Image
            src="/backgrounds/mission/wall-mission-3.png"
            alt="Muro"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="w-full flex items-center justify-between max-w-6xl gap-4 p-4">
          <p className="text-lg font-bold text-red-600 text-center flex-1">
            ¡Nos vemos el próximo viernes! Una nueva{" "}
            <span className="block">misión te estará esperando.</span>
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-red-600 hover:bg-red-700 text-white rounded-2xl px-6"
          >
            Continuar <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="hidden">
        {cards
          .filter((c) => c.type === "image")
          .map((c) => (
            <link key={c.uniqueId} rel="preload" href={c.content} as="image" />
          ))}
      </div>
      <div className="absolute inset-0 -z-10 bg-cover bg-center bg-[url('/backgrounds/mission/bg-mission-3.png')]" />
      <div className="flex flex-col w-full mx-auto px-4 py-2">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-start gap-2 w-full">
          <div className="flex flex-col w-full h-full gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  asChild
                  variant="destructive"
                  size="icon"
                  className="w-8 h-8 rounded-xl bg-red-600"
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
                    {mission.subtitle || "Erinnerungen zuordnen"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {isSurveyPhase ? "¡Parejas encontradas!" : "Parejas ocultas"}
                </h1>
                <p className="text-sm text-slate-500">
                  {isSurveyPhase
                    ? surveyQuestion?.question_text
                    : memoryQuestion?.question_text}
                </p>
              </div>
            </div>
            {!isSurveyPhase ? (
              <div className="grid grid-cols-4 lg:md:grid-cols-6 gap-2">
                {cards.map((card, index) => {
                  const isFlipped =
                    flippedIndices.includes(index) ||
                    matchedPairs.includes(card.pairId);
                  return (
                    <div
                      key={card.uniqueId}
                      onClick={() => handleCardClick(index)}
                      className={cn(
                        "aspect-square w-full rounded-lg cursor-pointer transition-all duration-200 relative overflow-hidden p-0 border will-change-transform transform-gpu",
                        isFlipped
                          ? "bg-white scale-[1.02]"
                          : "bg-[#1B365D] hover:scale-[1.01]",
                      )}
                    >
                      {isFlipped ? (
                        card.type === "image" ? (
                          <Image
                            src={card.content}
                            alt="Card"
                            fill
                            sizes="(max-width: 640px) 25vw, (max-width: 768px) 16vw, 12vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center p-1.5 text-center bg-white">
                            <span className="text-[9px] sm:text-[11px] font-bold text-slate-900 leading-tight">
                              {card.content}
                            </span>
                          </div>
                        )
                      ) : (
                        <Image
                          src={CARD_BACK_IMAGE}
                          alt="Back"
                          fill
                          sizes="(max-width: 640px) 25vw, (max-width: 768px) 16vw, 12vw"
                          className="object-cover"
                          priority
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <Textarea
                placeholder="Escribe aquí tu respuesta..."
                value={surveyText}
                onChange={(e) => setSurveyText(e.target.value)}
                className="w-full flex-1 h-full min-h-[250px] p-4 rounded-2xl border-slate-200 bg-white focus:border-red-600 focus:ring-0 resize-none shadow-sm"
              />
            )}
          </div>
          <MascotCallout
            imageSrc={
              isSurveyPhase
                ? "/mascot/otto-cards-survey.png"
                : "/mascot/otto-cards.png"
            }
            message={
              isSurveyPhase ? (
                <>
                  Compártenos{" "}
                  <span className="text-red-600 block">tu respuesta</span>
                </>
              ) : (
                <>
                  Encuentra las{" "}
                  <span className="text-red-600 block">parejas</span>
                </>
              )
            }
            orientation="vertical"
            className={
              isSurveyPhase
                ? "!w-fit self-center justify-self-center [&>div:first-child]:!text-xs [&>div:first-child]:!translate-x-8 [&>div:last-child]:!w-[260px] [&>div:last-child]:!h-[480px]"
                : "!w-fit self-end justify-self-center [&>div:first-child]:!text-xs [&>div:first-child]:!translate-x-8 [&>div:last-child]:!w-[260px] [&>div:last-child]:!h-[420px]"
            }
          />
        </div>
        <Card className="w-full bg-[#FFFDF9] border-slate-200/80 rounded-2xl shadow-none mt-4">
          <CardContent className="flex items-center justify-between">
            <Button
              asChild
              variant="outline"
              className="rounded-full border-red-300 text-red-600 hover:bg-red-50 shadow-none"
            >
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" /> Salir de la misión
              </Link>
            </Button>
            {!isSurveyPhase && (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-red-100 shadow-sm">
                <Clock className="w-4 h-4 text-red-600 animate-pulse" />
                <span className="text-base font-extrabold text-red-600 font-mono">
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
            {isSurveyPhase && (
              <Button
                onClick={handleFinalSubmit}
                disabled={!surveyText.trim() || submitting}
                className="rounded-xl font-medium px-6 bg-red-600 hover:bg-red-700 text-white shadow-none"
              >
                <span>{submitting ? "Guardando..." : "Finalizar misión"}</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>
        <MemoryResultDialog
          open={showResultModal}
          onOpenChange={setShowResultModal}
          isSuccess={!isTimeOut}
          earnedPoints={isTimeOut ? 0 : 10}
          onRetry={handleRetry}
          onContinue={
            !isTimeOut
              ? () => {
                  setShowResultModal(false);
                  setIsSurveyPhase(true);
                }
              : undefined
          }
          submitting={submitting}
        />
      </div>
    </>
  );
}
