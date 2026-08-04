"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MissionCardProps } from "@/types";
import { cn } from "@/lib/utils";
import {
  CardDescription,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Card,
  CardAction,
} from "@/components/ui/card";

import { Lock, ArrowRight, Check } from "lucide-react";
import Link from "next/link";

export function MissionCard({
  mission,
  isCompleted = false,
}: MissionCardProps) {
  const now = new Date();
  const unlockDate = new Date(mission.unlock_date);
  const isUnlocked = mission.is_active && now >= unlockDate;
  const formatUnlockDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(date);
  };
  return (
    <Card
      size="sm"
      className={cn(
        "relative h-full !gap-0 bg-white flex flex-col justify-between rounded-2xl transition-all duration-200 border shadow-sm overflow-hidden",
        isCompleted
          ? "border-emerald-400/80 shadow-emerald-400/5"
          : isUnlocked
            ? "border-amber-400 shadow-amber-400/10"
            : "border-slate-200/80",
      )}
    >
      <CardHeader className="pb-1">
        <CardTitle>
          <span
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shadow-inner",
              isUnlocked ? "bg-red-600 text-white" : "bg-slate-400 text-white",
            )}
          >
            {mission.week_number}
          </span>
        </CardTitle>
        <CardAction>
          {isCompleted ? (
            <Badge
              variant="outline"
              className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border-emerald-300 rounded-full tracking-wider uppercase px-2.5 py-0.5"
            >
              Completada
            </Badge>
          ) : isUnlocked ? (
            <Badge
              variant="outline"
              className="text-[10px] font-bold text-amber-500 bg-amber-50 border-amber-300 rounded-full tracking-wider uppercase px-2.5 py-0.5"
            >
              Activa
            </Badge>
          ) : (
            <Lock className="w-5 h-5 text-slate-400" />
          )}
        </CardAction>
        <CardDescription
          className={cn(
            "text-xs font-extrabold tracking-wider uppercase pt-1",
            isUnlocked ? "text-red-600" : "text-slate-500",
          )}
        >
          MISIÓN {mission.week_number}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-0 flex flex-col gap-0.5">
        <h3
          className={cn(
            "text-base sm:text-lg font-bold leading-tight tracking-tight",
            isUnlocked || isCompleted ? "text-slate-950" : "text-slate-500",
          )}
        >
          {mission.title}
        </h3>
        <p className="text-xs sm:text-sm font-medium text-slate-400">
          {mission.subtitle}
        </p>
      </CardContent>
      <CardFooter className="pt-4 pb-4 border-none bg-transparent">
        {isCompleted ? (
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full !h-10 border border-emerald-400 rounded-full hover:bg-emerald-100/60 transition-colors shadow-sm group p-0 overflow-hidden"
          >
            <Link
              href={`/mission/${mission.id}`}
              className="w-full h-full px-5 flex items-center justify-between gap-2 text-slate-950 text-xs font-bold"
            >
              <span className="truncate">Reintentar misión</span>
              <ArrowRight className="w-5 h-5 text-emerald-500 group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>
          </Button>
        ) : isUnlocked ? (
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full !h-10 border border-amber-400 rounded-full hover:bg-amber-100/60 transition-colors shadow-sm group p-0 overflow-hidden"
          >
            <Link
              href={`/mission/${mission.id}`}
              className="w-full h-full px-5 flex items-center justify-between gap-2 text-slate-950 text-xs font-bold"
            >
              <span className="truncate">Comenzar misión</span>
              <ArrowRight className="w-5 h-5 text-amber-500 group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>
          </Button>
        ) : (
          <div className="w-full text-center py-2">
            <p className="text-xs text-slate-400 font-medium capitalize">
              Se desbloquea el {formatUnlockDate(unlockDate)}
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
