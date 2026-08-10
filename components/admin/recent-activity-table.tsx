"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RecentActivity } from "@/types";

interface RecentActivityTableProps {
  activities: RecentActivity[];
  loading?: boolean;
}

const AVATAR_COLORS = [
  "bg-purple-700",
  "bg-blue-600",
  "bg-rose-700",
  "bg-amber-600",
  "bg-emerald-600",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatDate(isoString: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function RecentActivityTable({
  activities,
  loading = false,
}: RecentActivityTableProps) {
  return (
    <Card className="rounded-2xl border-none shadow-sm bg-white p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 className="text-xl font-bold text-slate-900">Actividad reciente</h3>
        <Button
          variant="link"
          className="text-amber-500 font-bold text-xs p-0 h-auto hover:text-amber-600"
        >
          Ver todo
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-none hover:bg-transparent text-slate-400 font-bold text-xs">
            <TableHead className="w-[180px]">Usuario</TableHead>
            <TableHead>Acción</TableHead>
            <TableHead>Detalle</TableHead>
            <TableHead className="text-right">Fecha</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i} className="border-none">
                <TableCell className="py-3.5">
                  <div className="h-8 bg-slate-100 animate-pulse rounded-full w-32" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-slate-100 animate-pulse rounded w-20" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-slate-100 animate-pulse rounded w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="h-4 bg-slate-100 animate-pulse rounded w-20 ml-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : activities.length === 0 ? (
            <TableRow className="border-none">
              <TableCell
                colSpan={4}
                className="text-center py-6 text-slate-400 text-sm"
              >
                No hay actividad reciente registrada.
              </TableCell>
            </TableRow>
          ) : (
            activities.map((item) => {
              const initial = item.user_name
                ? item.user_name.charAt(0).toUpperCase()
                : "?";
              const bgColor = getAvatarColor(item.user_name || "");

              return (
                <TableRow
                  key={item.id}
                  className="border-none hover:bg-slate-50/60 transition-colors"
                >
                  <TableCell className="font-semibold text-slate-900 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback
                          className={`${bgColor} text-white font-bold text-xs`}
                        >
                          {initial}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-bold text-slate-800">
                        {item.user_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-600">
                    {item.action}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-500">
                    {item.detail}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-400 text-right">
                    {formatDate(item.created_at)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
