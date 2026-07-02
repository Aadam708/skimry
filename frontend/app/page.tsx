import Image from "next/image";
import NavbarComponent from "./components/NavbarComponent";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-black font-sans overflow-hidden">
      {/* Navbar at the top */}
      <NavbarComponent />

      {/* Main Content: Layout spacing handled cleanly via vertical flex gap */}
      <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8 px-4 text-center">

        {/* Headline: Clean vertical stacking with a tight internal gap */}
        <h1 className="flex flex-col items-center justify-center gap-3 text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl">
          <span className="bg-linear-to-r from-blue-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
            All the info
          </span>
          <span className="bg-linear-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
            you need
          </span>
          <span className="text-4xl font-bold text-zinc-300 sm:text-6xl lg:text-7xl">
            zero fluff.
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="max-w-2xl text-lg font-light tracking-wide text-zinc-300 leading-relaxed mx-auto">
          Bust clickbait and long articles. <br className="hidden sm:block" />
          Instantly extract key points in 1-click with our browser extension.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 text-lg font-medium">
          {/* Purple Glow Hover */}
          <button className="rounded-full border border-white bg-transparent px-8 py-3 text-white transition-all duration-300 hover:border-purple-600 hover:bg-zinc-950/50 hover:shadow-[0_0_20px_rgba(147,51,234,0.6)] hover:cursor-pointer">
            See our plans
          </button>

          {/* Blue Glow Hover */}
          <button className="rounded-full bg-linear-to-r from-pink-500 to-red-500 px-8 py-3 text-white transition-all duration-300 hover:from-pink-400 hover:to-red-400 hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] hover:cursor-pointer">
            Get started
          </button>
        </div>

      </main>
    </div>
  );
}
