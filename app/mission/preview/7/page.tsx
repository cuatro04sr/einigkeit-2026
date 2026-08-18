import { MissionContainer } from "@/components/missions/mission-container";

// Mock data needed to render the container without Supabase
const mockMission = {
    id: "mission-7-mock-id",
    title: "Rompecabezas",
    subtitle: "Reconstruye la comunidad",
    week_number: 7,
    is_active: true,
    unlock_date: "2026-01-01T00:00:00Z"
};

const mockQuestion = {
    id: "question-7-mock-id",
    mission_id: "mission-7-mock-id",
    question_text: "Comparte un aprendizaje clave de esta actividad",
    question_type: "text",
    options: [],
    correct_option_id: "",
    order_index: 0
};

export default function Mission7Preview() {
    return <MissionContainer missionId="mission-7-mock-id" initialMission={mockMission as any} initialQuestions={[mockQuestion] as any} />;
}
