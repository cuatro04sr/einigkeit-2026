import { MissionContainer } from "@/components/missions/mission-container";
import { PageProps } from "@/types";

export default async function MissionPage({ params }: PageProps) {
  const { id } = await params;
  return <MissionContainer missionId={id} />;
}
