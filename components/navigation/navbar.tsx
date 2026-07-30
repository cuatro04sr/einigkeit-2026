import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-full items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center transition-opacity hover:opacity-80"
          >
            <Image
              src="/asodeca-logo.png"
              alt="Asodeca Logo"
              width={120}
              height={32}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
          <Separator orientation="vertical" />
          <Link
            href="/"
            className="flex items-center transition-opacity hover:opacity-80"
          >
            <Image
              src="/einigkeit-logo.png"
              alt="Einigkeit Logo"
              width={120}
              height={32}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="shadow-none border-gray-300 hover:bg-gray-100"
          >
            <Link href="/account" className="flex items-center gap-2">
              <span>Mi cuenta</span>
              <User className="h-4 w-4" />
            </Link>
          </Button>
          <Separator orientation="vertical" />
          <Button
            variant="outline"
            size="sm"
            asChild
            className="shadow-none border-gray-300 hover:bg-gray-100"
            title="Cerrar sesión"
          >
            <Link href="/logout">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Cerrar sesión</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
