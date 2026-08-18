"use client";

//import { MatchingView } from "@/components/missions/views/matching-view";
import { PhotoView } from "@/components/missions/views/photo-view";
import { QuizView } from "@/components/missions/views/quiz-view";
import { JigsawView } from "@/components/missions/views/jigsaw-view";
import { createClient } from "@/lib/client";
import { Mission, Question } from "@/types";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const supabase = createClient();

export function MissionContainer({
  missionId,
  initialMission,
  initialQuestions,
}: {
  missionId: string;
  initialMission?: Mission;
  initialQuestions?: Question[];
}) {
  const [mission, setMission] = useState<Mission | null>(initialMission || null);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions || []);
  const [loading, setLoading] = useState(!initialMission);

  useEffect(() => {
    if (initialMission) return; // Si ya vienen los datos pasados directamente (ej. mock app), no hace fetch

    async function fetchMissionData() {
      try {
        setLoading(true);
        const { data: missionData, error: mError } = await supabase
          .from("missions")
          .select("*")
          .eq("id", missionId)
          .single();
        if (mError) throw mError;
        const { data: questionsData, error: qError } = await supabase
          .from("questions")
          .select("*")
          .eq("mission_id", missionId)
          .order("order_index", { ascending: true });
        if (qError) throw qError;
        setMission(missionData);
        setQuestions(questionsData || []);
      } catch (error) {
        toast.error("Error al cargar la misión", {
          description:
            error instanceof Error ? error.message : "Error desconocido",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchMissionData();
  }, [missionId]);
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }
  if (!mission) return <div>Misión no encontrada</div>;
  const quizQuestions = questions.filter(
    (q) => !q.question_type?.startsWith("survey_"),
  );
  const surveyQuestion = questions.find((q) =>
    q.question_type?.startsWith("survey_"),
  );
  console.log(questions, mission);
  switch (mission.week_number) {
    case 1:
      return (
        <QuizView
          mission={mission}
          questions={quizQuestions}
          surveyQuestion={surveyQuestion}
        />
      );
    case 2:
      return <PhotoView mission={mission} question={questions[0]} />;
    /*
    case 3:
      return <MatchingView mission={mission} questions={questions} />;
    */
    case 4:
      return <div>Trivia / Ahorcado (Semana 4)</div>;
    case 5:
      return <div>Ruleta (Semana 5)</div>;
    case 6:
      return <div>Trivial (Semana 6)</div>;
    case 7:
      return <JigsawView mission={mission} question={questions[0]} />;
    default:
      return <div>Tipo de misión no soportado</div>;
  }
}
