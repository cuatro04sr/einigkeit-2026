import { MascotDialogProps } from "@/types";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  Dialog,
} from "@/components/ui/dialog";

import Image from "next/image";

export function MascotDialog({
  open,
  onOpenChange,
  title,
  imageSrc,
  imageAlt = "Mascota",
  children,
}: MascotDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[95vw] sm:!max-w-3xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl
                   bg-white lg:bg-cover lg:bg-center lg:bg-no-repeat
                   lg:bg-[url('/backgrounds/auth/dialog-desktop.png')]"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-full sm:flex-row items-center p-6 sm:p-10 gap-6 sm:gap-8">
          <div className="relative w-full sm:w-1/2 h-52 sm:h-72 flex items-center justify-center">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="relative w-full h-fit sm:w-1/2 flex items-center justify-center">
            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
