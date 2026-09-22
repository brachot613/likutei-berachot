'use client';

import React, { useState, useEffect, useMemo } from 'react';
import brachotData from '@/data/brachot.json';

interface Bracha {
  id: string;
  title: string;
  category: string;
  hebrew: string;
  transliteration: string;
  translation: string;
}

const categories = [
  'Összes',
  'Kenyér és tészta',
  'Bor és italok',
  'Gyümölcsök',
  'Zöldségek',
  'Egyéb ételek',
  'Reggeli áldások'
];

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Összes');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'favorites'>('search');
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(0);

  // Csak kliens oldalon fusson le a localStorage olvasás, ezzel elkerülve a hidratációs hibát
  useEffect(() => {
    setIsMounted(true);
    const savedFavs = localStorage.getItem('likutei_favorites');
    if (savedFavs) {
      try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}
    }
    const savedFont = localStorage.getItem('likutei_font_level');
    if (savedFont) {
      setFontSizeLevel(parseInt(savedFont, 10));
    }
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated;
    if (favorites.includes(id)) {
      updated = favorites.filter(favId => favId !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    localStorage.setItem('likutei_favorites', JSON.stringify(updated));
  };

  const changeFontSize = (delta: number) => {
    const newLevel = Math.max(0, Math.min(2, fontSizeLevel + delta));
    setFontSizeLevel(newLevel);
    localStorage.setItem('likutei_font_level', newLevel.toString());
  };

  const getHebrewSizeClass = () => {
    if (fontSizeLevel === 1) return 'text-3xl leading-relaxed';
    if (fontSizeLevel === 2) return 'text-4xl leading-loose';
    return 'text-2xl leading-relaxed';
  };

  const getTranslitSizeClass = () => {
    if (fontSizeLevel === 1) return 'text-lg';
    if (fontSizeLevel === 2) return 'text-xl';
    return 'text-base';
  };

  const filteredBrachot = useMemo(() => {
    return (brachotData as Bracha[]).filter(b => {
      const matchesCategory = selectedCategory === 'Összes' || b.category === selectedCategory;
      const matchesSearch = 
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.transliteration.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.translation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.hebrew.includes(searchTerm);
      
      if (activeTab === 'favorites') {
        return matchesCategory && matchesSearch && favorites.includes(b.id);
      }
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory, activeTab, favorites]);

  // Amíg a kliens nem töltődött be teljesen, üres/semleges hátteret mutatunk, elkerülve a villanást
  if (!isMounted) {
    return <main className="min-h-screen bg-[#0b0f17]" />;
  }

  return (
    <main className="min-h-screen bg-[#0b0f17] text-[#e2e8f0] pb-24 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Fejléc és Betűméret */}
      <header className="border-b border-slate-800/80 bg-[#0b0f17]/90 backdrop-blur-md sticky top-0 z-30 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-wide text-amber-100/90 text-center md:text-left">
              לקוטי ברכות
            </h1>
            <p className="text-xs text-amber-500/80 tracking-widest uppercase text-center md:text-left mt-0.5 font-sans">
              Likutei Berachot • Áldások Gyűjteménye
            </p>
          </div>

          {/* Betűméret vezérlők */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg p-1">
            <button 
              onClick={() => changeFontSize(-1)}
              className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
              title="Kisebb betűk"
            >
              A-
            </button>
            <span className="text-xs text-slate-500">|</span>
            <button 
              onClick={() => changeFontSize(1)}
              className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
              title="Nagyobb betűk"
            >
              A+
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-6">
        {activeTab === 'search' && (
          <div className="space-y-4 mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Keresés áldásra, kulcsszóra..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all shadow-inner"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-sm"
                >
                  Törlés
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border border-slate-800/60 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="mb-6 bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 text-center">
            <h2 className="text-amber-200/90 font-serif text-lg">Mentett Kedvencek</h2>
            <p className="text-xs text-slate-400 mt-1">A leggyakrabban használt áldásaid gyorselérése.</p>
          </div>
        )}

        <div className="space-y-4">
          {filteredBrachot.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/30 border border-slate-800/50 rounded-2xl">
              <p className="text-slate-400 text-sm">
                {activeTab === 'favorites' ? 'Még nincsenek mentett kedvenceid.' : 'Nincs találat a megadott feltételre.'}
              </p>
            </div>
          ) : (
            filteredBrachot.map((bracha) => {
              const isFav = favorites.includes(bracha.id);
              return (
                <div 
                  key={bracha.id}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-amber-500/30 transition-all shadow-sm relative group"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-amber-500/80 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                        {bracha.category}
                      </span>
                      <h3 className="text-lg font-serif font-medium text-slate-100 mt-2">
                        {bracha.title}
                      </h3>
                    </div>

                    <button
                      onClick={(e) => toggleFavorite(bracha.id, e)}
                      className={`p-2 rounded-xl border transition-all ${
                        isFav 
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' 
                          : 'bg-slate-800/50 border-slate-700/50 text-slate-500 hover:text-slate-300'
                      }`}
                      title={isFav ? 'Eltávolítás a kedvencekből' : 'Hozzáadás a kedvencekhez'}
                    >
                      <svg className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  </div>

                  <div className="my-4 text-right font-serif text-amber-100/95 tracking-wide" dir="rtl">
                    <p className={getHebrewSizeClass()}>{bracha.hebrew}</p>
                  </div>

                  <div className="border-t border-slate-800/80 pt-3 space-y-2">
                    <div>
                      <span className="text-[10px] tracking-wider uppercase text-slate-500 block mb-0.5">Átírás</span>
                      <p className={`text-amber-200/80 font-sans italic ${getTranslitSizeClass()}`}>
                        {bracha.transliteration}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] tracking-wider uppercase text-slate-500 block mb-0.5">Jelentés</span>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {bracha.translation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#0b0f17]/95 backdrop-blur-lg border-t border-slate-800/80 z-40 py-2 px-6">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex flex-col items-center py-1.5 px-6 rounded-xl transition-all ${
              activeTab === 'search'
                ? 'text-amber-400 bg-amber-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs font-medium">Áldáskereső</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex flex-col items-center py-1.5 px-6 rounded-xl transition-all relative ${
              activeTab === 'favorites'
                ? 'text-amber-400 bg-amber-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-amber-500 text-[#0b0f17] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">Kedvencek</span>
          </button>
        </div>
      </nav>
    </main>
  );
}