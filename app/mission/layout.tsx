import { Navbar } from "@/components/navigation/navbar";

export default function MissionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="relative flex-1 w-full flex items-center justify-center p-4 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
