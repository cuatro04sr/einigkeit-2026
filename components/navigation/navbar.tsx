"use client";

import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/client";
import { NAVBAR_LOGOS } from "@/constants";

import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import Link from "next/link";

export function Navbar() {
  const router = useRouter();
  const supabase = createClient();
  const { user, profile, setUser, setProfile } = useAuthStore();
  const isAuthenticated = Boolean(user);
  const firstName =
    profile?.first_name || user?.user_metadata?.first_name || "Usuario";
  const handleLogout = async () => {
    toast.promise(
      supabase.auth.signOut().then(({ error }) => {
        if (error) throw error;
        setUser(null);
        setProfile(null);
        router.push("/login");
        router.refresh();
      }),
      {
        loading: "Cerrando sesión...",
        success: "Sesión cerrada correctamente",
        error: "No se pudo cerrar la sesión",
      },
    );
  };
  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-3 h-8">
          {NAVBAR_LOGOS.map((logo, index) => (
            <div key={logo.src} className="flex items-center gap-3 h-full">
              {index > 0 && <Separator orientation="vertical" />}
              <Link href="/" className="transition-opacity hover:opacity-80">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={120}
                  height={32}
                  className="h-8 w-auto object-contain"
                  priority
                />
              </Link>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 h-8">
          {isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="shadow-none border-gray-300 gap-2 disabled:opacity-100 disabled:bg-background disabled:text-foreground cursor-default"
            >
              <span>Hola, {firstName}</span>
              <User className="h-4 w-4 text-primary" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="shadow-none border-gray-300 hover:bg-gray-100 gap-2"
            >
              <Link href="/login">
                <span>Mi cuenta</span>
                <User className="h-4 w-4" />
              </Link>
            </Button>
          )}
          {isAuthenticated && (
            <>
              <Separator orientation="vertical" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="shadow-none border-gray-300 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 px-2.5 transition-colors"
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
