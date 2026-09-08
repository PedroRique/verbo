import { DiskGuide } from "@/components/disk-guide";

export default function Home() {
  return (
    <main className="relative isolate min-h-full flex-1">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_circle_at_10%_-10%,oklch(0.45_0.12_70_/_0.28),transparent_55%),radial-gradient(900px_circle_at_90%_0%,oklch(0.35_0.08_40_/_0.2),transparent_50%),linear-gradient(180deg,#14110e,#0c0b0a)]"
      />
      <DiskGuide />
    </main>
  );
}
