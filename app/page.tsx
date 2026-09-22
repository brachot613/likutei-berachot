'use client';

import { useState, useMemo } from 'react';
import brachotData from '@/data/brachot.json';

interface Bracha {
  id: string;
  category: string;
  title: string;
  when: string;
  hebrew: string;
  phonetic: string;
  translation: string;
}

export default function Home() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Összes');

  const categories = useMemo(() => {
    const cats = new Set((brachotData as Bracha[]).map((b) => b.category));
    return ['Összes', ...Array.from(cats)];
  }, []);

  const filteredBrachot = useMemo(() => {
    return (brachotData as Bracha[]).filter((b) => {
      const matchesCategory =
        selectedCategory === 'Összes' || b.category === selectedCategory;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.when.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.phonetic.toLowerCase().includes(q) ||
        b.translation.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 overflow-x-hidden font-sans">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;500;700&family=Playfair+Display:ital,wght@0,500;0,700;1,400&display=swap');
        
        .hebrew-title {
          font-family: 'Frank Ruhl Libre', serif;
          letter-spacing: 0.1em;
        }
      `}</style>

      <main className="w-full max-w-3xl mx-auto p-4 md:p-6 flex flex-col gap-6">
        
        {/* Klasszikus Áldásgyűjtemény Címlap */}
        <header className="text-center w-full mt-4 pb-6 border-b border-amber-500/20 relative">
          <div className="text-amber-500/50 text-xs tracking-[0.25em] uppercase mb-2 font-serif">
            — LIKUTEI BERACHOT —
          </div>
          
          <h1 className="text-2xl md:text-4xl font-bold text-amber-400 mb-3 font-['Playfair_Display'] tracking-wide">
            Áldásgyűjtemény
          </h1>

          {/* Autentikus, pontozatlan héber cím (Likutei Berachot) */}
          <div className="flex items-center justify-center gap-4 my-2 text-amber-300">
            <span className="h-[1px] w-12 md:w-20 bg-gradient-to-r from-transparent to-amber-500/40"></span>
            <span className="text-2xl md:text-3xl font-bold hebrew-title" dir="rtl">
              לקוטי ברכות
            </span>
            <span className="h-[1px] w-12 md:w-20 bg-gradient-to-l from-transparent to-amber-500/40"></span>
          </div>
          
          <p className="text-slate-400 text-xs md:text-sm italic font-serif mt-2">
            Mindennapi zsidó áldások és útmutató
          </p>
        </header>

        {/* Keresősáv */}
        <div className="w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Keresés az áldások, alkalmak között..."
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 shadow-inner text-sm md:text-base transition-all"
          />
        </div>

        {/* Kategória gombok */}
        <div className="flex flex-wrap gap-2 justify-center w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                  : 'bg-slate-900 text-slate-300 border border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="text-slate-500 text-xs text-right w-full font-serif">
          Találatok: {filteredBrachot.length} áldás
        </div>

        {/* Kártyák */}
        <div className="flex flex-col gap-4 w-full pb-12">
          {filteredBrachot.length === 0 ? (
            <div className="text-center py-10 text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800/60 font-serif">
              Nincs a keresésnek megfelelő áldás.
            </div>
          ) : (
            filteredBrachot.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/80 rounded-xl p-4 md:p-6 border border-slate-800/80 hover:border-amber-500/30 transition-all flex flex-col gap-3.5 w-full shadow-lg"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <h2 className="text-lg md:text-xl font-bold text-amber-300 font-['Playfair_Display']">
                    {item.title}
                  </h2>
                  <span className="text-[10px] md:text-xs px-2.5 py-1 rounded-md bg-slate-950 text-amber-200/60 border border-slate-800 font-mono">
                    {item.category}
                  </span>
                </div>
                
                <div className="text-xs md:text-sm text-amber-200/70 italic font-serif flex items-center gap-1.5">
                  <span className="text-amber-500/60">Alkalom:</span> {item.when}
                </div>

                {/* Héber szöveg - hagyományos könyv keretben */}
                <div
                  dir="rtl"
                  className="text-right text-2xl md:text-3xl font-serif text-amber-50/95 bg-[#070a0f] p-4 md:p-5 rounded-lg border border-amber-500/15 leading-relaxed shadow-inner"
                  style={{ fontFamily: "'Frank Rühl Libre', 'Times New Roman', serif" }}
                >
                  {item.hebrew}
                </div>

                {/* Fonetikus kiejtés */}
                <div className="flex flex-col gap-1 pt-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Kiejtés:</span>
                  <p className="text-xs md:text-sm font-medium text-amber-100/90 font-serif tracking-wide">
                    {item.phonetic}
                  </p>
                </div>

                {/* Magyar fordítás */}
                <div className="flex flex-col gap-1 border-t border-slate-800/60 pt-3">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Jelentés:</span>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
                    {item.translation}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        
      </main>
    </div>
  );
}