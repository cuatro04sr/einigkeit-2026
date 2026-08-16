import { WordsearchView } from "@/components/missions/views/wordsearch-view";

/**
 * Mock preview page for Mission 8 — accessible at /mission/preview/8
 * Uses only mock data from constants/mission-8.ts, no Supabase calls needed.
 */
const MOCK_MISSION = {
    id: "mock-mission-8",
    title: "Sopa de Letras",
    subtitle: "Einigkeit 2026",
    week_number: 8,
    is_active: true,
    unlock_date: new Date().toISOString(),
};

export default function Mission8PreviewPage() {
    return <WordsearchView mission={MOCK_MISSION} />;
}
