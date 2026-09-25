import { Navbar } from "@/components/navigation/navbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="relative flex-1 w-full bg-[#FAF1E6] flex items-center justify-center p-4 py-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
