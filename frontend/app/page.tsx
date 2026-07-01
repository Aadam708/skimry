import Image from "next/image";
import logo from '../public/images/logo.png'
import NavbarComponent from "./components/NavbarComponent";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-black font-sans overflow-hidden">
      {/* Render the Navbar at the top */}
      <NavbarComponent />

      {/* Main Content Centered */}
      <main className="flex flex-1 flex-col items-center justify-center p-8 px-4 text-center mt-16 md:mt-0">

        {/* Shifting Gradient Text - Stacked vertically */}
        <h1 className="flex flex-col items-center justify-center gap-2 md:gap-4 text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl">
          <span className="bg-linear-to-r from-blue-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
            All the info
          </span>
          <span className="bg-linear-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
            you need
          </span>
          <span className="mt-4 text-4xl sm:text-6xl lg:text-7xl text-zinc-300 font-bold">
            zero fluff.
          </span>
        </h1>

        {/* Sub-headline / Explanation Paragraph */}
        <p className="pt-8 max-w-2xl text-lg md:text-xl text-zinc-300 font-light tracking-wide mx-auto leading-relaxed">
          Bust clickbait and long articles. <br className="hidden sm:block" />
          Instantly extract key points in 1-click with our browser extension.
        </p>


        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 pt-10 text-lg font-medium">
          {/* Purple Glow Hover */}
          <button className="rounded-full border border-white bg-transparent px-8 py-3 text-white transition-all duration-300 hover:border-purple-600 hover:bg-zinc-950/50 hover:shadow-[0_0_20px_rgba(147,51,234,0.6)]">
            See our plans
          </button>

          {/* Blue Glow Hover */}
          <button className="rounded-full bg-linear-to-r from-pink-500 to-red-500 px-8 py-3 text-white transition-all duration-300 hover:border-blue-600 hover:bg-linear-to-r hover:from-pink-400 hover:to-red-400 hover:cursor-pointer hover:shadow-[0_0_20px_rgba(37,99,235,0.6)]">
            Get started
          </button>
        </div>

      </main>
    </div>
  );
}
