import { CardSkeleton } from "@/components/landing/card-skeleton";
import { MissionCard } from "@/components/landing/mission-card";
import { MissionCardsGridProps } from "@/types";

export function MissionsCardsGrid({
  missions,
  completedMissionIds,
  isLoading,
}: MissionCardsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mx-auto">
      {isLoading || missions.length === 0
        ? Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))
        : missions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              isCompleted={completedMissionIds.has(mission.id)}
            />
          ))}
    </div>
  );
}
