import { Navbar } from "@/components/navigation/navbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="relative flex-1 w-full bg-cover bg-center bg-no-repeat bg-[url('/bg-mobile-white.png')] lg:bg-[size:100%_100%] lg:bg-center lg:bg-[url('/backgrounds/bg-asistencia.png')] flex items-center justify-center p-4 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
