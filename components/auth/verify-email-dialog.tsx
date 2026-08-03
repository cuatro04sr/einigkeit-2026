import { MascotDialog } from "@/components/shared/mascot-dialog";
import { VerifyEmailDialogProps } from "@/types";
import { Button } from "@/components/ui/button";

import { MailCheck } from "lucide-react";

export function VerifyEmailDialog({
  open,
  onOpenChange,
  email,
}: VerifyEmailDialogProps) {
  return (
    <MascotDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Verifica tu correo electrónico"
      imageSrc="/otto-happy.png"
      imageAlt="Mascota de bienvenida"
    >
      <div className="flex flex-col h-full justify-center gap-3">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-red-600 tracking-tight leading-none">
          ¡Casi listo!
        </h2>
        <p className="text-base sm:text-lg text-slate-800 font-medium leading-snug">
          Hemos enviado un enlace de confirmación a{" "}
          <span className="font-bold text-slate-950">
            {email || "tu correo electrónico"}
          </span>
          .
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          Por favor, revisa tu bandeja de entrada o la carpeta de spam para
          verificar tu cuenta e ingresar al juego.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button
            onClick={() => window.open("https://mail.google.com", "_blank")}
            className="h-12 px-5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-md w-full sm:w-auto"
          >
            Ir a mi correo
            <MailCheck className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-12 px-5 border-slate-300 text-slate-700 hover:bg-slate-100 font-bold rounded-xl text-sm sm:text-base transition-all w-full sm:w-auto"
          >
            Entendido
          </Button>
        </div>
      </div>
    </MascotDialog>
  );
}
