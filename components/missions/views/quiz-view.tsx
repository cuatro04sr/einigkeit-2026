"use client";

import { QuizResultDialog } from "@/components/missions/views/quiz-result-dialog";
import { MascotCallout } from "@/components/shared/mascot-callout";
import { OptionIcon } from "@/components/missions/icon-helper";
import { QuizViewProps, UserResponsePayload } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/client";
import { cn } from "@/lib/utils";

import { ArrowLeft, Check, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

const supabase = createClient();

export function QuizView({
  mission,
  questions,
  surveyQuestion,
}: QuizViewProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [isSurveyPhase, setIsSurveyPhase] = useState(false);
  const [surveySelectedOption, setSurveySelectedOption] = useState("");
  const [surveyText, setSurveyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const currentQuestion = questions[currentIndex];
  const activeQuestion = isSurveyPhase ? surveyQuestion : currentQuestion;
  if (!activeQuestion) return null;
  const activeSelectedId = isSurveyPhase
    ? surveySelectedOption
    : selectedOptions[currentQuestion?.id];
  const handleSelectOption = (optionId: string) => {
    if (isSurveyPhase) {
      setSurveySelectedOption(optionId);
    } else {
      setSelectedOptions((prev) => ({
        ...prev,
        [currentQuestion.id]: optionId,
      }));
    }
  };
  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }
    const correctCount = questions.reduce((acc, q) => {
      return selectedOptions[q.id] === q.correct_option_id ? acc + 1 : acc;
    }, 0);
    setCorrectAnswersCount(correctCount);
    setEarnedPoints(correctCount * 10);
    setShowResultModal(true);
  };
  const handleRetry = () => {
    setShowResultModal(false);
    setSelectedOptions({});
    setCurrentIndex(0);
  };
  const handleModalContinue = () => {
    setShowResultModal(false);
    if (surveyQuestion) {
      setIsSurveyPhase(true);
    } else {
      handleFinalSubmit();
    }
  };
  const handleFinalSubmit = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para guardar tu progreso");
      return;
    }
    try {
      setSubmitting(true);
      const responsesToInsert: UserResponsePayload[] = questions.map((q) => ({
        user_id: user.id,
        mission_id: mission.id,
        question_id: q.id,
        selected_option: selectedOptions[q.id],
        is_correct: selectedOptions[q.id] === q.correct_option_id,
        points_earned:
          (selectedOptions[q.id] === q.correct_option_id) == true ? 10 : 0,
      }));
      if (surveyQuestion && surveySelectedOption) {
        responsesToInsert.push({
          user_id: user.id,
          mission_id: mission.id,
          question_id: surveyQuestion.id,
          selected_option: surveySelectedOption,
          text_answer: surveyText || null,
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
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al guardar respuestas";
      toast.error("Error al completar la misión", { description: message });
    } finally {
      setSubmitting(false);
    }
  };
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
            src="/backgrounds/mission/wall-mission-1.png" // Cambia esta ruta por la de tu imagen del muro
            alt="Muro con apertura"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="w-full flex items-center justify-between max-w-6xl">
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-600 text-center max-w-xl leading-snug px-4">
            Tu participación abrió la primera apertura en el muro que separa
            nuestras generaciones.
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
      <div
        className="absolute inset-0 -z-10 pointer-events-none
                   bg-cover bg-center bg-no-repeat
                   bg-[url('/bg-mobile-white.png')]
                   lg:bg-[size:100%_100%] lg:bg-center
                   lg:bg-[url('/backgrounds/mission/bg-mission-1.png')]"
      />
      <div className="flex flex-col w-full mx-auto px-4 py-2">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] items-self-center gap-8 w-full">
          <div className="flex flex-col justify-between w-full max-w-2xl gap-5 mb-5">
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
                  {mission.subtitle}
                </span>
              </div>
            </div>

            {!isSurveyPhase && (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-semibold text-slate-400">
                  Pregunta {currentIndex + 1} de {questions.length}
                </p>
                <div className="flex items-center gap-2 w-full max-w-xs">
                  {questions.map((q, index) => (
                    <div
                      key={q.id || index}
                      className={cn(
                        "h-2 flex-1 rounded-full transition-all duration-300",
                        index < currentIndex
                          ? "bg-blue-950"
                          : index === currentIndex
                            ? "bg-blue-600"
                            : "bg-slate-200",
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
              {activeQuestion.question_text}
            </h1>

            <div
              className={cn(
                "grid gap-3 flex-1 items-stretch",
                isSurveyPhase
                  ? "grid-cols-2 sm:grid-cols-5"
                  : "grid-cols-2 sm:grid-cols-4",
              )}
            >
              {activeQuestion.options?.map((option) => {
                const isSelected = activeSelectedId === option.id;
                return (
                  <Card
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    className={cn(
                      "group relative cursor-pointer border shadow-none transition-all duration-200 hover:shadow-sm py-0 h-full",
                      isSelected
                        ? "border-blue-600 bg-blue-50/10 ring-2 ring-blue-600/20"
                        : "border-slate-200 hover:border-slate-300",
                    )}
                  >
                    <CardContent className="flex flex-col items-center justify-between p-4 h-full text-center">
                      <div
                        className={cn(
                          "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 shrink-0",
                          option.color || "bg-amber-100 text-amber-500",
                        )}
                      >
                        <OptionIcon
                          iconName={option.icon}
                          className="w-6 h-6 sm:w-7 sm:h-7"
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-800 leading-snug my-2">
                        {option.label}
                      </span>
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0",
                          isSelected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-300 bg-transparent",
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {isSurveyPhase && (
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-semibold text-slate-700">
                  ¿Por qué? (Opcional)
                </label>
                <Textarea
                  placeholder="Cuéntanos un poco más..."
                  value={surveyText}
                  onChange={(e) => setSurveyText(e.target.value)}
                  className="w-full min-h-[90px] rounded-xl border-slate-200 focus:border-blue-600 focus:ring-blue-600/20"
                />
              </div>
            )}
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
                <Button
                  onClick={isSurveyPhase ? handleFinalSubmit : handleNext}
                  size="lg"
                  disabled={!activeSelectedId || submitting}
                  className={cn(
                    "rounded-xl font-medium px-4 sm:px-6 text-sm transition-all flex items-center justify-center gap-2 shadow-none shrink-0",
                    activeSelectedId
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-slate-300 text-slate-500 cursor-not-allowed",
                  )}
                >
                  <span>
                    {submitting
                      ? "Guardando..."
                      : isSurveyPhase
                        ? "Finalizar Misión"
                        : currentIndex < questions.length - 1
                          ? "Siguiente"
                          : "Finalizar"}
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </Button>
              </CardContent>
            </Card>
          </div>
          <MascotCallout
            imageSrc="/mascot/otto-mission.png"
            message={
              <>
                Elige una <span className="text-red-600 block">respuesta</span>
              </>
            }
            orientation="horizontal"
            className="!w-fit self-center justify-self-center
                      [&>div:first-child]:!text-xs [&>div:first-child]:!max-w-[110px]
                      [&>div:last-child]:!w-[260px] [&>div:last-child]:!h-[340px]"
          />
        </div>
        <QuizResultDialog
          open={showResultModal}
          onOpenChange={setShowResultModal}
          correctAnswers={correctAnswersCount}
          totalQuestions={questions.length}
          earnedPoints={earnedPoints}
          onRetry={handleRetry}
          onContinue={handleModalContinue}
          submitting={submitting}
        />
      </div>
    </>
  );
}
