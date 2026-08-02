"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CollapsibleContent,
  CollapsibleTrigger,
  Collapsible,
} from "@/components/ui/collapsible";
import { StepCardProps } from "@/types";

import { ChevronRight } from "lucide-react";

export function StepCard({
  number,
  title,
  description,
  extraText,
  icon: Icon,
  colors,
}: StepCardProps) {
  return (
    <Collapsible className="group w-full">
      <Card className="h-[110px] overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md border-border flex items-center">
        <CardContent className="flex items-center justify-between gap-3 w-full">
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-white text-sm ${colors.numberBg}`}
              >
                {number}
              </span>
              <h3 className="text-base font-bold tracking-tight text-foreground truncate">
                {title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${colors.iconBg} ${colors.iconColor}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-xs font-medium text-muted-foreground leading-tight line-clamp-2">
                {description}
              </p>
            </div>
          </div>
          <div className="flex items-center pl-1 shrink-0 gap-2">
            <CollapsibleContent className="overflow-hidden transition-all duration-300 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right-2 data-[state=open]:slide-in-from-right-2">
              <div className="flex items-center gap-3">
                <Separator
                  orientation="vertical"
                  className="w-[1.5px] bg-foreground/80 h-8"
                />
                <CollapsibleTrigger asChild>
                  <div className="max-w-[120px] text-[11px] font-medium leading-snug text-foreground cursor-pointer">
                    {extraText}
                  </div>
                </CollapsibleTrigger>
              </div>
            </CollapsibleContent>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="p-1.5 text-foreground hover:opacity-80 focus:outline-none"
                aria-label="Ver detalles"
              >
                <ChevronRight className="h-5 w-5 stroke-[2.5] transition-transform duration-300 group-data-[state=open]:rotate-90" />
              </button>
            </CollapsibleTrigger>
          </div>
        </CardContent>
      </Card>
    </Collapsible>
  );
}
