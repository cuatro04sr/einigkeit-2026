import { LucideIcon } from "lucide-react";
import React from "react";

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
