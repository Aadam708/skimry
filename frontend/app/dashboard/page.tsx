"use client";

import React, { useState, useEffect } from 'react';
import DashNavbarComponent from '../components/DashNavbarComponent';

interface Material {
  id: string;
  title: string;
  aiSummary: string[];
  originalUrl: string;
  date: string;
}

export default function DashboardPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:8080/api/materials/my', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();

        const transformedMaterials: Material[] = data.map((item: any) => ({
          id: item.materialId,
          title: generateTitle(item.aiSummary),
          aiSummary: item.aiSummary || [],
          originalUrl: item.originalUrl,
          date: formatDate(item.createdAt),
        }));

        setMaterials(transformedMaterials);
      } else if (response.status === 401) {
        setError('Not authenticated. Please log in first.');
      } else {
        setError('Failed to fetch materials');
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const generateTitle = (aiSummary: string[]) => {
    if (!aiSummary || aiSummary.length === 0) return 'Unknown Summary';

    const firstPoint = aiSummary[0];
    const words = firstPoint.split(" ");

    if (words.length <= 5) return firstPoint;
    return words.slice(0, 5).join(" ") + "...";
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-pink-500/30 selection:text-pink-200">
      <DashNavbarComponent />

      <div className="relative mx-auto max-w-[1600px] px-6 pt-24 pb-12 sm:px-10 sm:pt-28 lg:pb-16">

        <div className="absolute top-0 left-1/4 -z-10 h-72 w-72 rounded-full bg-pink-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 -z-10 h-96 w-96 rounded-full bg-purple-600/10 blur-[150px] pointer-events-none" />

        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-zinc-900 pb-8 mb-10">
          <div className="space-y-1.5 max-w-2xl">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl bg-linear-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Knowledge Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Review and access your compressed insights from our chrome extension.
            </p>
          </div>

          <div className="w-full md:w-auto rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3 backdrop-blur-md flex items-center justify-between md:inline-flex md:flex-col md:items-start md:justify-center min-w-40">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Total Summaries</span>
            <span className="text-lg md:text-xl font-bold bg-linear-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mt-0.5">
              {materials.length} Saved
            </span>
          </div>
        </header>

        {loading && materials.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-pink-500" />
              <p className="text-sm text-zinc-400">Loading your materials...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={fetchMaterials}
              className="mt-2 text-xs font-semibold text-red-300 hover:text-red-200 underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && materials.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-pink-500/10 flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-zinc-200">No materials yet</h3>
              <p className="text-sm text-zinc-400 max-w-md">
                Use the Skimry Chrome extension to extract and summarize content from any website.
              </p>
            </div>
          </div>
        )}

        {!loading && materials.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {materials.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedMaterial(item)}
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
                    {item.title}
                  </h3>

                  <div className="relative mt-3 text-sm text-zinc-400 leading-relaxed max-h-19 overflow-hidden">
                    <ul className="space-y-2 font-normal group-hover:text-zinc-300 transition-colors duration-500">
                      {item.aiSummary.slice(0, 3).map((point, idx) => (
                        <li key={idx} className="flex gap-2 line-clamp-2">
                          <span className="text-pink-500 shrink-0">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="absolute bottom-0 left-0 h-8 w-full bg-linear-to-t from-zinc-950/40 to-transparent pointer-events-none group-hover:from-transparent transition-all duration-500" />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-zinc-800/60 pt-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
                    {item.aiSummary.length} Key Points
                  </span>

                  <a
                    href={item.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors group/btn"
                  >
                    View source
                    <span className="transform transition-transform duration-500 group-hover/btn:translate-x-1 text-pink-500 font-bold">
                      →
                    </span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedMaterial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedMaterial(null)}
        >
          <div
            className="relative bg-zinc-900 rounded-2xl border border-zinc-800 max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedMaterial(null)}
              className="absolute top-4 right-4 z-10 text-zinc-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="border-b border-zinc-800 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-100 mb-2 leading-snug">
                    {selectedMaterial.title}
                  </h2>
                  <p className="text-sm text-zinc-400">{selectedMaterial.date}</p>
                </div>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
                  {selectedMaterial.aiSummary.length} Key Points
                </h3>
                <ul className="space-y-3">
                  {selectedMaterial.aiSummary.map((point, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="text-pink-500 font-bold shrink-0 mt-0.5">
                        {idx + 1}.
                      </span>
                      <span className="text-zinc-300 leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-zinc-800 p-6 flex gap-3">
              <a
                href={selectedMaterial.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition-colors text-center"
              >
                View Original Source
              </a>
              <button
                onClick={() => setSelectedMaterial(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
