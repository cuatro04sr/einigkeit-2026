import { Navbar } from "@/components/navigation/navbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      {/* Añadimos 'relative' aquí para que sea el marco de contención */}
      <main className="relative flex-1 w-full flex items-center justify-center p-4 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
