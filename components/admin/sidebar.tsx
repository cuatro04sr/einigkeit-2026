"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Image as ImageIcon,
  Star,
  ClipboardCheck,
  TrendingUp,
  MapPin,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { label: "Panel", href: "/admin", icon: Home },
  { label: "Exalumnos", href: "/admin/exalumnos", icon: Users },
  { label: "Contenido", href: "/admin/contenido", icon: ImageIcon },
  { label: "Misiones", href: "/admin/misiones", icon: Star },
  {
    label: "Confirmaciones",
    href: "/admin/confirmaciones",
    icon: ClipboardCheck,
  },
  { label: "Ranking", href: "/admin/ranking", icon: TrendingUp },
  { label: "Mapa mundial", href: "/admin/mapa", icon: MapPin },
  { label: "Configuración", href: "/admin/configuracion", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-slate-200 bg-white">
      <SidebarHeader className="p-6 items-center">
        <Image
          src="/logos/asodeca-logo.png"
          alt="ASODECA Logo"
          width={120}
          height={90}
          priority
          className="object-contain"
        />
      </SidebarHeader>
      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarMenu className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={`relative h-8 px-4 text-sm font-medium rounded-xl transition-all duration-150 ${
                      isActive
                        ? "bg-amber-50/80 text-amber-500 font-semibold hover:bg-amber-50/90 hover:text-amber-500"
                        : "text-slate-900 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-4 w-full"
                    >
                      {isActive && (
                        <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-l-full" />
                      )}
                      <Icon
                        className={`w-5 h-5 shrink-0 ${
                          isActive ? "text-amber-500" : "text-slate-900"
                        }`}
                      />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-2 py-1">
          <Avatar className="w-10 h-10 border border-slate-200">
            <AvatarImage src="/logos/asodeca-logo.png" alt="ASODECA" />
            <AvatarFallback className="bg-amber-100 text-amber-800 font-bold">
              TM
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-left">
            <span className="text-sm font-semibold text-slate-900 leading-tight">
              ASODECA
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Administrador
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
