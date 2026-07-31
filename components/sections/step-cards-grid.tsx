"use client";

import { StepCard } from "./step-card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  User,
  ListOrdered,
  UserCheck,
  Gift,
  Clock,
  Handshake,
} from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    id: 1,
    title: "Regístrate",
    desc: "Crea tu perfil y entra al juego",
    extra: "En tu perfil se guardará tu progreso.",
    icon: User,
    color: {
      numberBg: "bg-red-600",
      iconBg: "bg-red-100 dark:bg-red-950",
      iconColor: "text-red-500",
    },
  },
  {
    id: 2,
    title: "Completa misiones",
    desc: "Responde, comparte y suma puntos",
    extra: "Las misiones son retos, darán progreso a quién logre superarlas.",
    icon: ListOrdered,
    color: {
      numberBg: "bg-blue-600",
      iconBg: "bg-blue-100 dark:bg-blue-950",
      iconColor: "text-blue-500",
    },
  },
  {
    id: 3,
    title: "Desbloqueo semanal",
    desc: "Cada viernes se habilita una nueva misión.",
    extra:
      "Una vez termines una misión, espera a la próxima semana por una nueva",
    icon: UserCheck,
    color: {
      numberBg: "bg-amber-400 text-black",
      iconBg: "bg-amber-100 dark:bg-amber-950",
      iconColor: "text-amber-500",
    },
  },
  {
    id: 4,
    title: "Sorpresas y premios",
    desc: "Al llegar al final tendrás una recompensa",
    extra: "Las recompensas mantendrán tu motivación para llegar al final.",
    icon: Gift,
    color: {
      numberBg: "bg-emerald-600",
      iconBg: "bg-emerald-100 dark:bg-emerald-950",
      iconColor: "text-emerald-600",
    },
  },
  {
    id: 5,
    title: "Fecha límite",
    desc: "Tienes plazo hasta el 28 de septiembre de 2026",
    extra: "Recuerda inscribirte a tiempo para empezar en el momento oportuno.",
    icon: Clock,
    color: {
      numberBg: "bg-red-600",
      iconBg: "bg-red-100 dark:bg-red-950",
      iconColor: "text-red-500",
    },
  },
  {
    id: 6,
    title: "Gran reencuentro",
    desc: "El evento final...",
    extra: (
      <span>
        Completa las 8 misiones y prepárate para el encuentro del{" "}
        <span className="text-red-500 font-semibold block">
          Sábado 3 de octubre de 2026
        </span>
      </span>
    ),
    icon: Handshake,
    color: {
      numberBg: "bg-blue-600",
      iconBg: "bg-blue-100 dark:bg-blue-950",
      iconColor: "text-blue-500",
    },
  },
];

export function StepCardsGrid() {
  return (
    <div className="w-full my-6 flex flex-col lg:flex-row items-center lg:items-end gap-4 lg:gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 w-full">
        {STEPS.map((step) => (
          <StepCard
            key={step.id}
            number={step.id}
            title={step.title}
            description={step.desc}
            extraText={step.extra}
            icon={step.icon}
            colors={step.color}
          />
        ))}
      </div>

      <div className="shrink-0 flex items-center justify-center w-full lg:w-auto">
        <Button
          asChild
          size="lg"
          className="group flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-6 rounded-xl shadow-md transition-all hover:shadow-lg w-full lg:w-auto min-h-[52px]"
        >
          <Link href="/login">
            <span className="whitespace-nowrap text-base">
              Comenzar a jugar
            </span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
