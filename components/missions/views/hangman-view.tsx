"use client";

import { QuizViewProps, UserResponsePayload } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/client";
import { cn } from "@/lib/utils";
import { OptionIcon } from "@/components/missions/icon-helper";

import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  SmileIcon,
  Check,
  StarIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { HangmanResultDialog } from "./hangman-result-dialog";

const supabase = createClient();

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type RabbitPart =
  | "head"
  | "torso"
  | "leftArm"
  | "rightArm"
  | "legs"
  | "leftEar"
  | "rightEar";

const RABBIT_PARTS: RabbitPart[] = [
  "head",
  "torso",
  "leftArm",
  "rightArm",
  "legs",
  "leftEar",
  "rightEar",
];

const PART_ASSET: Record<RabbitPart, string> = {
  head: "/bunny/head.png",
  torso: "/bunny/torso.png",
  leftArm: "/bunny/left-arm.png",
  rightArm: "/bunny/right-arm.png",
  legs: "/bunny/legs.png",
  leftEar: "/bunny/left-ear.png",
  rightEar: "/bunny/right-ear.png",
};

const PART_STYLE: Record<RabbitPart, string> = {
  head: "left-1/2 top-16 w-24 -translate-x-1/2 z-50",
  torso: "left-1/2 top-36 w-30 -translate-x-1/2 z-40",
  leftArm: "left-[45%] top-43 w-13 -translate-x-full",
  rightArm: "left-[54%] top-44 w-13 z-30",
  legs: "left-[49.5%] top-55 w-30 -translate-x-1/2 z-30",
  leftEar: "left-[47%] top-2 w-13 -translate-x-full -rotate-6",
  rightEar: "left-[53%] top-2 w-13 rotate-6",
};

export function HangmanView({
  mission,
  questions,
  surveyQuestion,
}: QuizViewProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guessedLettersMap, setGuessedLettersMap] = useState<
    Record<string, string[]>
  >({});
  const [isSurveyPhase, setIsSurveyPhase] = useState(false);
  const [surveySelectedOption, setSurveySelectedOption] = useState("");
  const [surveyText, setSurveyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isFailureModal, setIsFailureModal] = useState(false);

  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questions[currentIndex];
  const activeQuestion = isSurveyPhase ? surveyQuestion : currentQuestion;

  const targetWord = useMemo(() => {
    if (!currentQuestion) return "";
    return (currentQuestion.question_text || "").toUpperCase().trim();
  }, [currentQuestion]);

  const guessedLetters = useMemo(() => {
    if (!currentQuestion) return [];
    return guessedLettersMap[currentQuestion.id] || [];
  }, [guessedLettersMap, currentQuestion]);

  const wrongGuesses = useMemo(() => {
    return guessedLetters.filter((letter) => !targetWord.includes(letter));
  }, [guessedLetters, targetWord]);

  const maxErrors = RABBIT_PARTS.length;

  const isWordGuessed = useMemo(() => {
    if (!targetWord) return false;
    return targetWord
      .split("")
      .every((char) => char === " " || guessedLetters.includes(char));
  }, [targetWord, guessedLetters]);

  const isGameOver = wrongGuesses.length >= maxErrors || isWordGuessed;

  if (!activeQuestion && !isSurveyPhase) return null;

  const handleSelectLetter = (letter: string) => {
    if (isGameOver || isSurveyPhase) return;
    if (guessedLetters.includes(letter)) return;

    const newGuessedLetters = [...guessedLetters, letter];

    const newWrongGuesses = newGuessedLetters.filter(
      (l) => !targetWord.includes(l),
    );
    const willBeGameOver = newWrongGuesses.length >= maxErrors;

    // Calculamos si con esta letra se completa la palabra de inmediato
    const willBeWordGuessed = targetWord
      .split("")
      .every((char) => char === " " || newGuessedLetters.includes(char));

    setGuessedLettersMap((prev) => ({
      ...prev,
      [currentQuestion.id]: newGuessedLetters,
    }));

    if (willBeGameOver) {
      setIsFailureModal(true);
      setShowResultModal(true);
    } else if (willBeWordGuessed) {
      setIsFailureModal(false);
      setShowResultModal(true);
    }
  };

  const handleSurveyOptionSelect = (optionId: string) => {
    setSurveySelectedOption(optionId);
  };

  const handleRetry = () => {
    setShowResultModal(false);
    setIsFailureModal(false);
    setGuessedLettersMap({});
    setCurrentIndex(0);
    setIsSurveyPhase(false);
  };

  const handleModalContinue = () => {
    setShowResultModal(false);
    if (isFailureModal) {
      handleRetry();
      return;
    }

    // Si hay más palabras, avanzamos a la siguiente
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    // Si ya era la última palabra y hay encuesta, pasamos a la encuesta
    if (surveyQuestion && !isSurveyPhase) {
      setIsSurveyPhase(true);
      return;
    }

    // Si no hay encuesta, enviamos todo
    handleFinalSubmit();
  };

  const handleFinalSubmit = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para guardar tu progreso");
      return;
    }
    try {
      setSubmitting(true);
      const responsesToInsert: UserResponsePayload[] = questions.map((q) => {
        const word = (q.question_text || "").toUpperCase().trim();
        const letters = guessedLettersMap[q.id] || [];
        const failed = letters.filter((l) => !word.includes(l)).length;
        const isCorrect =
          word.split("").every((c) => c === " " || letters.includes(c)) &&
          failed < maxErrors;
        return {
          user_id: user.id,
          mission_id: mission.id,
          question_id: q.id,
          selected_option: letters.join(","),
          is_correct: isCorrect,
          points_earned: isCorrect ? 10 : 0,
        };
      });

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
            src="/backgrounds/mission/wall-mission-6.png"
            alt="Muro con apertura"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="w-full flex items-center justify-between max-w-6xl">
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-600 text-center max-w-xl leading-snug px-4">
            Solo faltan dos misiones para el gran reencuentro.
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

  const visibleParts = RABBIT_PARTS.slice(0, wrongGuesses.length);

  return (
    <>
      <div
        className="absolute inset-0 -z-10 pointer-events-none
                   bg-cover bg-center bg-no-repeat
                   bg-[url('/bg-mobile-white.png')]
                   lg:bg-[size:100%_100%] lg:bg-center
                   lg:bg-[url('/backgrounds/mission/bg-mission-6.png')]"
      />
      <div className="flex flex-col w-full max-w-6xl mx-auto px-4 py-2">
        {/* Barra superior de navegación */}
        <div className="flex items-center gap-3 mb-6">
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
              {mission.subtitle || "Galgenmännchen"}
            </span>
          </div>
        </div>

        {/* Grilla principal */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-start gap-6 lg:gap-8 w-full">
          <div className="flex flex-col w-full gap-5">
            {!isSurveyPhase ? (
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <SmileIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                      Juego del ahorcado
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Adivina la palabra en alemán. ¡Cuidado con armar el conejo
                      por los errores!
                    </p>
                  </div>
                </div>

                {/* Líneas de la palabra secreta */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 my-2">
                  {targetWord.split("").map((char, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center justify-center w-8 sm:w-10 border-b-4 border-slate-800 h-10 sm:h-12 text-xl sm:text-2xl font-bold text-slate-900"
                    >
                      {char === " "
                        ? ""
                        : guessedLetters.includes(char) ||
                            (isWordGuessed && isGameOver)
                          ? char
                          : "_"}
                    </div>
                  ))}
                </div>

                {/* Teclado responsivo */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold text-slate-500">
                    Selecciona la letra:
                  </p>
                  <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-10 lg:grid-cols-9 gap-1.5">
                    {ALPHABET.map((letter) => {
                      const isGuessed = guessedLetters.includes(letter);
                      const isCorrectGuess =
                        isGuessed && targetWord.includes(letter);
                      const isWrongGuess =
                        isGuessed && !targetWord.includes(letter);

                      return (
                        <Button
                          key={letter}
                          onClick={() => handleSelectLetter(letter)}
                          disabled={isGuessed || isGameOver}
                          variant="outline"
                          className={cn(
                            "h-9 sm:h-10 text-xs sm:text-sm font-bold rounded-lg border bg-white p-0 transition-colors",
                            !isGuessed &&
                              "border-blue-500 text-blue-600 hover:bg-blue-50",
                            isCorrectGuess &&
                              "border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
                            isWrongGuess &&
                              "border-red-300 bg-red-50 text-red-600 hover:bg-red-50",
                            isGameOver && isGuessed && "cursor-not-allowed",
                          )}
                        >
                          {letter}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <StarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                      Ahora que descubriste la palabra secreta
                    </h1>
                    <p className="text-xs sm:text-sm text-black">
                      Cuéntanos{" "}
                      <span className="font-medium">
                        {surveyQuestion?.question_text}
                      </span>
                    </p>
                  </div>
                </div>
                {/* Opciones de la encuesta */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-stretch">
                  {surveyQuestion?.options?.map((option) => {
                    const isSelected = surveySelectedOption === option.id;
                    return (
                      <Card
                        key={option.id}
                        onClick={() => handleSurveyOptionSelect(option.id)}
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
                            {isSelected && (
                              <Check className="w-3 h-3 stroke-[3]" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <Textarea
                    placeholder="Cuéntanos tu recuerdo o anécdota...*"
                    value={surveyText}
                    onChange={(e) => setSurveyText(e.target.value)}
                    className="w-full min-h-[90px] rounded-xl bg-white border-slate-200 focus:border-blue-600 focus:ring-blue-600/20"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Columna Derecha: Horca y piezas del conejo */}
          <div className="flex flex-col items-center justify-center self-center w-full lg:w-auto">
            {!isSurveyPhase ? (
              <div className="relative h-80 w-100 max-w-full flex items-center justify-center">
                <div
                  data-testid="gallows"
                  aria-hidden="true"
                  className="absolute inset-0 z-0 flex justify-end items-center"
                >
                  <Image
                    src="/bunny/gallows.png"
                    alt="Estructura de la horca"
                    width={230}
                    height={350}
                    className="object-contain"
                    priority
                  />
                </div>

                {visibleParts.map((part) => (
                  <Image
                    key={part}
                    data-testid="rabbit-part"
                    data-part={part}
                    src={PART_ASSET[part]}
                    alt=""
                    width={200}
                    height={280}
                    className={`absolute z-10 h-auto ${PART_STYLE[part]}`}
                  />
                ))}
              </div>
            ) : (
              <div className="relative h-75 w-60 max-w-full flex items-center justify-center">
                <Image
                  src="/mascot/otto-crossword-survey.png"
                  alt="Otto"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            )}
          </div>
        </div>

        {/* Barra de Acciones Inferior */}
        <Card className="w-full bg-[#FFFDF9] border-slate-200/80 rounded-2xl shadow-none py-0 mt-6">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 gap-3">
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

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {!isSurveyPhase && (
                <Button
                  onClick={() => setGuessedLettersMap({})}
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto rounded-full border-red-600 bg-red-600 hover:bg-red-500 hover:text-white text-white font-medium px-4 text-sm shadow-none shrink-0"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  <span>Reiniciar</span>
                </Button>
              )}

              {isSurveyPhase && (
                <Button
                  onClick={handleFinalSubmit}
                  disabled={!surveySelectedOption || submitting}
                  size="lg"
                  className={cn(
                    "w-full sm:w-auto rounded-xl font-medium px-6 text-sm transition-all flex items-center justify-center gap-2 shadow-none shrink-0",
                    surveySelectedOption
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-slate-300 text-slate-500 cursor-not-allowed",
                  )}
                >
                  <span>
                    {submitting ? "Guardando..." : "Finalizar Misión"}
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <HangmanResultDialog
          open={showResultModal}
          onOpenChange={setShowResultModal}
          isSuccess={!isFailureModal}
          onRetry={handleRetry}
          onContinue={handleModalContinue}
          submitting={submitting}
        />
      </div>
    </>
  );
}
