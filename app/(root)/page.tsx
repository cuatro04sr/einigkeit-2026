"use client";

import { AuthenticatedHero } from "@/components/landing/authenticated-hero";
import { useAuthStore } from "@/store/useAuthStore";
import { Hero } from "@/components/landing/hero";

export default function HomePage() {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return null;
  return user ? <AuthenticatedHero /> : <Hero />;
}
