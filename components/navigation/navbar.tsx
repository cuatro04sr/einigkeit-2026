import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { NAVBAR_LOGOS } from "@/constants";

import { LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Navbar() {
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
          <Separator orientation="vertical" />
          <Button
            variant="outline"
            size="sm"
            asChild
            className="shadow-none border-gray-300 hover:bg-gray-100 px-2.5"
            title="Cerrar sesión"
          >
            <Link href="/logout" aria-label="Cerrar sesión">
              <LogOut className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
