"use client";

import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/client";
import { NAVBAR_LOGOS } from "@/constants";

const supabase = createClient();

export function Navbar() {
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const isAuthenticated = Boolean(user);
  const firstName =
    profile?.first_name || user?.user_metadata?.first_name || "Usuario";
  const handleLogout = async () => {
    toast.promise(
      async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        router.push("/login");
      },
      {
        loading: "Cerrando sesión...",
        success: "Sesión cerrada correctamente",
        error: "No se pudo cerrar la sesión",
      },
    );
  };
  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto grid grid-cols-3 h-full items-center px-4 sm:px-6">
        <div className="flex items-center justify-start gap-2 sm:gap-3 h-8 overflow-x-auto no-scrollbar">
          {NAVBAR_LOGOS.map((logo, index) => (
            <div
              key={logo.src}
              className="flex items-center gap-2 sm:gap-3 h-full shrink-0"
            >
              {index > 0 && (
                <Separator orientation="vertical" className="h-5" />
              )}
              <Link href="/" className="transition-opacity hover:opacity-80">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={120}
                  height={32}
                  className="h-6 sm:h-8 w-auto object-contain"
                  priority
                />
              </Link>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center h-8">
          <Image
            src="/logos/tq-logo.png"
            alt="TQ Logo"
            width={120}
            height={32}
            className="h-6 sm:h-8 w-auto object-contain"
            priority
          />
        </div>
        <div className="flex items-center justify-end gap-1.5 sm:gap-3 h-8">
          {isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="shadow-none border-gray-300 gap-1.5 sm:gap-2 px-2 sm:px-3 text-xs sm:text-sm disabled:opacity-100 disabled:bg-background disabled:text-foreground cursor-default truncate max-w-[130px] sm:max-w-none"
            >
              <span className="truncate">Hola, {firstName}</span>
              <User className="h-4 w-4 text-primary shrink-0" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="shadow-none border-gray-300 hover:bg-gray-100 gap-1.5 sm:gap-2 px-2.5 sm:px-3 text-xs sm:text-sm"
            >
              <Link href="/login">
                <span className="hidden sm:inline">Mi cuenta</span>
                <span className="sm:hidden">Ingresar</span>
                <User className="h-4 w-4 shrink-0" />
              </Link>
            </Button>
          )}
          {isAuthenticated && (
            <>
              <Separator orientation="vertical" className="h-5 shrink-0" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="shadow-none border-gray-300 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 px-2 sm:px-2.5 transition-colors shrink-0 cursor-pointer"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
