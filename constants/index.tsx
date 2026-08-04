import {
  User,
  ListOrdered,
  UserCheck,
  Gift,
  Clock,
  Handshake,
} from "lucide-react";
import { StepItem } from "@/types";

export const HERO_CARDS_STEPS: StepItem[] = [
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
    desc: "Son 8 misiones.",
    extra:
      "Son 8 misiones, una cada semana, durante 8 semanas. Avanzas a medida que superas cada misión.",
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
      "Una vez termines una misión, espera a la próxima semana por la siguiente.",
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
    desc: "Al llegar al final tendrás una recompensa.",
    extra: "Las recompensas mantendrán tu movitación para llegar al final.",
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
    desc: "Tienes plazo hasta el 28 de septiembre de 2026.",
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
    extra: "Confirma tu asistencia al encuentro: Sábado 3 de octubre 2026",
    icon: Handshake,
    color: {
      numberBg: "bg-blue-600",
      iconBg: "bg-blue-100 dark:bg-blue-950",
      iconColor: "text-blue-500",
    },
  },
];

export const NAVBAR_LOGOS = [
  { src: "/logos/asodeca-logo.png", alt: "Asodeca Logo" },
  { src: "/logos/einigkeit-logo.png", alt: "Einigkeit Logo" },
];
