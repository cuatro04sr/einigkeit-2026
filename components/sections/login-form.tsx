"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { createClient } from "@/lib/client";
import { useAuthStore } from "@/store/useAuthStore";
import { Field, FieldLabel } from "../ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { MascotCalloutVertical } from "./mascot-callout-vertical";

export default function LoginForm() {
  const supabase = createClient();
  const router = useRouter();
  const { setUser, setProfile } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const loginProcess = async () => {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError || !authData.user) {
      throw new Error("Credenciales inválidas. Por favor intenta de nuevo.");
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profileData) {
      throw new Error("Error obteniendo el perfil del usuario.");
    }

    // Actualizamos el estado global
    setUser(authData.user);
    setProfile(profileData);

    // Redireccionamos según el rol
    if (profileData.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }

    return profileData;
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Integramos toast.promise con la función de autenticación
    toast.promise(loginProcess(), {
      loading: "Iniciando sesión...",
      success: "¡Bienvenido de nuevo! Redirigiendo...",
      error: (err) =>
        err instanceof Error
          ? err.message
          : "Ocurrió un error al iniciar sesión",
      finally: () => setLoading(false),
      position: "top-center",
    });
  };

  return (
    <>
      {/* 1. Mascot Callout Vertical: Absolute contenido en los límites del contenedor/main */}
      <div className="hidden lg:flex h-full absolute top-0 right-0 z-0 pointer-events-none items-center justify-end">
        <div className="pointer-events-auto">
          <MascotCalloutVertical imageSrc="/otto-rabbit-2.png" />
        </div>
      </div>
      <Card className="w-full max-w-2xl !p-4 sm:!p-8 bg-white rounded-xl shadow-xl gap-4 sm:gap-6">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-slate-950">
            Continúa tu misión
          </CardTitle>
          <CardDescription className="text-base sm:text-md text-slate-600">
            Usa tus datos para retomar tus misiones en{" "}
            <span className="font-bold text-red-600">
              &ldquo;Einigkeit&rdquo;
            </span>{" "}
            2026.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-12">
          <form id="login-form" onSubmit={handleLogin} className="grid gap-4">
            {/* Email */}
            <Field>
              <FieldLabel htmlFor="email" className="sr-only">
                Correo electrónico
              </FieldLabel>
              <InputGroup className="h-12 rounded-xl border-slate-300 focus-within:ring-2 focus-within:ring-red-200 focus-within:border-red-400">
                <InputGroupAddon align="inline-start" className="pl-4">
                  <Mail className="h-5 w-5 text-slate-400" />
                </InputGroupAddon>
                <InputGroupInput
                  id="email"
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-base"
                />
              </InputGroup>
            </Field>

            {/* Password */}
            <Field>
              <FieldLabel htmlFor="password" className="sr-only">
                Contraseña
              </FieldLabel>
              <InputGroup className="h-12 rounded-xl border-slate-300 focus-within:ring-2 focus-within:ring-red-200 focus-within:border-red-400">
                <InputGroupAddon align="inline-start" className="pl-4">
                  <Lock className="h-5 w-5 text-slate-400" />
                </InputGroupAddon>
                <InputGroupInput
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-base"
                />
                <InputGroupAddon align="inline-end" className="pr-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="h-9 w-9 text-slate-400 hover:text-slate-600 hover:bg-transparent"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </Button>
                </InputGroupAddon>
              </InputGroup>
            </Field>

            <Link
              href="/recover-password"
              className="text-slate-900 font-medium text-sm underline hover:text-slate-700 transition"
            >
              Recuperar contraseña
            </Link>
          </form>
        </CardContent>

        <CardFooter className="px-12 py-0 justify-items-center grid gap-3 border-none">
          <Button
            form="login-form"
            type="submit"
            disabled={loading}
            className="relative w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold text-xl rounded-xl transition duration-300 group"
          >
            {loading ? "Ingresando..." : "Comenzar a jugar"}

            {!loading && (
              <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-white group-hover:translate-x-1 transition-transform" />
            )}
          </Button>

          <p className="text-md">¿Es tu primera vez?</p>

          <Button
            asChild
            variant="outline"
            className="w-xs h-12 bg-white hover:bg-slate-50 text-red-600 hover:text-red-700 font-bold text-base rounded-xl border-red-600 transition duration-300"
          >
            <Link href="/register">Crear mi cuenta</Link>
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
