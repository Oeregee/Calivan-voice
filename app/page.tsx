import AudioEngine from "@/components/AudioEngine";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-4 text-white font-sans selection:bg-indigo-500/30">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-[#0a0a0e] to-black"></div>
      <div className="relative z-10 w-full flex justify-center">
        <AudioEngine />
      </div>
    </main>
  );
}
