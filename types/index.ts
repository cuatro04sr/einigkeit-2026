import { User } from "@supabase/supabase-js";
import { LucideIcon } from "lucide-react";
import React, { ReactNode } from "react";

export interface StepColorConfig {
  numberBg: string;
  iconBg: string;
  iconColor: string;
}

export interface StepItem {
  id: number;
  title: string;
  desc: string;
  extra: React.ReactNode;
  icon: LucideIcon;
  color: StepColorConfig;
}

export interface StepCardsGridProps {
  steps: StepItem[];
  className?: string;
}

export interface StepCardProps {
  number: number;
  title: string;
  description: string;
  extraText: React.ReactNode;
  icon: LucideIcon;
  colors: StepColorConfig;
}

export interface MascotCalloutProps {
  imageSrc: string;
  message: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export interface FormFieldProps {
  id: string;
  placeholder: string;
  icon: LucideIcon;
  type?: string;
  autoComplete: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  rightAction?: React.ReactNode;
}

export interface SelectOption {
  code: string;
  name: string;
}

export interface LocationSelectProps {
  id: string;
  placeholder: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  options: SelectOption[];
  autoComplete?: string;
}

export interface RegisterFormState {
  firstName: string;
  lastName: string;
  abi: string;
  email: string;
  password: string;
  showPassword: boolean;
  whatsapp: string;
  countryCode: string;
  stateCode: string;
  city: string;
  loading: boolean;
  showVerifyDialog: boolean;
}

export interface VerifyEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
}

export interface QuizResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  correctAnswers: number;
  totalQuestions: number;
  earnedPoints: number;
  onRetry: () => void;
  onContinue: () => void;
  submitting?: boolean;
}

export interface MascotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  imageSrc: string;
  imageAlt?: string;
  children: ReactNode;
}

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  abi: string;
  whatsapp: string;
  country: string;
  state: string;
  city: string;
  app_role: "user" | "admin";
  points: number;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  clearAuth: () => void;
}

export interface Mission {
  id: string;
  title: string;
  subtitle: string;
  week_number: number;
  is_active: boolean;
  unlock_date: string;
}

export interface MissionCardProps {
  mission: Mission;
  isCompleted?: boolean;
  isPerfect?: boolean;
  earnedPoints: number;
}

export interface MissionCardsGridProps {
  missions: Mission[];
  completedMissionIds: Set<string>;
  pointsPerMission: Record<string, number>;
  perfectMissionIds: Set<string>;
  isLoading: boolean;
}

export interface Option {
  id: string;
  label: string;
  icon?: string;
  color?: string;
}

export interface Question {
  id: string;
  mission_id: string;
  question_text: string;
  question_type: string;
  options: Option[];
  correct_option_id: string;
  order_index: number;
}

export interface PageProps {
  params: Promise<{ id: string }>;
}

export interface QuizViewProps {
  mission: Mission;
  questions: Question[];
  surveyQuestion: Question | undefined;
}

export type UserResponsePayload = {
  user_id: string;
  mission_id: string;
  question_id: string;
  selected_option: string;
  is_correct: boolean | null;
  points_earned: number;
  text_answer?: string | null;
};

export interface MissionResponseJoinedRecord {
  id: string;
  created_at: string;
  selected_option: string;
  text_answer: string | null;
  is_correct: boolean | null;
  points_earned: number;
  profiles: Pick<
    Profile,
    "first_name" | "last_name" | "abi" | "whatsapp" | "country" | "city"
  > | null;
  missions: Pick<Mission, "title" | "week_number"> | null;
  questions: Pick<Question, "question_text" | "question_type"> | null;
}

export type CSVExportRow = Record<
  string,
  string | number | boolean | null | undefined
>;

export interface AdminHeaderProps {
  missions?: Mission[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export interface StatItem {
  id: string;
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
}

export interface StatsProps {
  items: StatItem[];
  loading?: boolean;
}

export interface RecentActivity {
  id: string;
  user_name: string;
  action: string;
  detail: string;
  created_at: string;
}

export interface RecentActivityTableProps {
  activities: RecentActivity[];
  loading?: boolean;
}

export interface GeoLocation {
  country: string;
  state: string;
  city: string;
  abi?: string | number;
  user_count?: number;
}

export interface GeographicScopeCardProps {
  locations?: GeoLocation[];
  profilesCount: number;
  loading?: boolean;
}

export interface WallProgressCardProps {
  registeredProfiles: number;
  targetProfiles?: number;
  missions?: Mission[];
  loading?: boolean;
}

export interface AlumniTableProps {
  profiles: Profile[];
  loading?: boolean;
}

export interface ProfileLocationData {
  country: string | null;
  state: string | null;
  city: string | null;
  abi: string | null;
}

export interface AbiRankingItem {
  abi: string;
  participants: number;
  completedMissions: number;
  points: number;
}

export interface UserResponseRow {
  user_id: string;
  mission_id: string;
  profiles: { abi: string | null } | null;
}

export interface ProfileRow {
  id: string;
  abi: string | null;
  points: number | null;
}

export interface AbiStats {
  participantsSet: Set<string>;
  completedMissionsSet: Set<string>;
  pointsSum: number;
}
