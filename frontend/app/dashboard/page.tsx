"use client";

import React, { useState } from 'react';
import DashNavbarComponent from '../components/DashNavbarComponent';

const mockSummariesFromDb = [
    { id: "1", rawText: "The company's scalability targets for Q3 are heavily reliant on migrating monolithic assets into decoupled microservices, aiming to decrease API response latency by 35% through Redis caching clusters...", date: "July 12, 2026" },
    { id: "2", rawText: "Haskell parametric polymorphism allows functions to be executed uniformly across any type standard without explicit runtime modifications. Exploring Paterson's type structures...", date: "July 10, 2026" },
    { id: "3", rawText: "Next.js App Router metrics emphasize the elimination of client-side JavaScript overhead by streaming Server Components directly over HTTP pipes to minimize initial load weight...", date: "July 08, 2026" },
    { id: "4", rawText: "Database isolation levels like Serializable prevent dirty reads and write skew errors, though they create high performance locking overhead under heavy concurrent loads...", date: "July 05, 2026" },
];

export default function DashboardPage() {
    const [summaries] = useState(mockSummariesFromDb);

    const generateTitle = (text: string) => {
        const words = text.split(" ");
        if (words.length <= 5) return text;
        return words.slice(0, 5).join(" ") + "...";
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-pink-500/30 selection:text-pink-200">
            {/* Top Navigation Anchor */}
            <DashNavbarComponent />

            {/*
               Knowledge dashboard section
            */}
            <div className="relative mx-auto max-w-[1600px] px-6 pt-24 pb-12 sm:px-10 sm:pt-28 lg:pb-16">

                {/* Visual Glow Ambient Background Flares */}
                <div className="absolute top-0 left-1/4 -z-10 h-72 w-72 rounded-full bg-pink-600/10 blur-[120px] pointer-events-none" />
                <div className="absolute top-1/3 right-1/4 -z-10 h-96 w-96 rounded-full bg-purple-600/10 blur-[150px] pointer-events-none" />

                {/* for small screens it is flex-col to make the items stacked to not wrap messily
                */}
                <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-zinc-900 pb-8 mb-10">
                    <div className="space-y-1.5 max-w-2xl">
                        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl bg-linear-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                            Knowledge Dashboard
                        </h1>
                        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                            Review and access your compressed insights from our chrome extension.
                        </p>
                    </div>

                    {/* Action Stats Counter: Stays structural and aligned on mobile */}
                    <div className="w-full md:w-auto rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3 backdrop-blur-md flex items-center justify-between md:inline-flex md:flex-col md:items-start md:justify-center min-w-40">
                        <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Total Summaries</span>
                        <span className="text-lg md:text-xl font-bold bg-linear-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mt-0.5">
                            {summaries.length} Saved
                        </span>
                    </div>
                </header>

                {/* Grid Layout Setup */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {summaries.map((item) => {
                        const generatedTitle = generateTitle(item.rawText);

                        return (
                            <div
                                key={item.id}
                                className="relative flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6
                                transition-all duration-500 hover:border-pink-500/40 hover:cursor-pointer
                                 hover:bg-zinc-900/60 hover:shadow-xl hover:shadow-pink-500/5 group"
                            >
                                <div>
                                    <div className="flex items-center justify-between text-xs text-zinc-500">
                                        <span>{item.date}</span>
                                        <div className="h-1.5 w-1.5 rounded-full bg-zinc-700 group-hover:bg-pink-500 transition-colors duration-500" />
                                    </div>

                                    <h3 className="mt-3 text-lg font-bold text-zinc-200 tracking-tight group-hover:text-pink-400 transition-colors duration-500 line-clamp-1">
                                        {generatedTitle}
                                    </h3>

                                    <div className="relative mt-3 text-sm text-zinc-400 leading-relaxed max-h-19 overflow-hidden">
                                        <p className="line-clamp-3 font-normal group-hover:text-zinc-300 transition-colors duration-500">
                                            {item.rawText}
                                        </p>
                                        <div className="absolute bottom-0 left-0 h-8 w-full bg-linear-to-t from-zinc-950/40 to-transparent pointer-events-none group-hover:from-transparent transition-all duration-500" />
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-between border-t border-zinc-800/60 pt-4">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
                                        3 Key Points
                                    </span>

                                    <button
                                        className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors group/btn"
                                    >
                                        Read full summary
                                        <span className="transform transition-transform duration-500 group-hover/btn:translate-x-1 text-pink-500 font-bold">
                                            →
                                        </span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}
