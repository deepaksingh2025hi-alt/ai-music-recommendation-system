import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  Bell,
  ChevronDown,
  Clock,
  Play,
  X,
  ArrowUpRight,
  Music2,
  TrendingUp,
} from 'lucide-react';
import { Song } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { usePlayer } from '../../context/PlayerContext';
import { normalizeQueryTypo } from '../../utils/queryNormalizer';

interface NavbarProps {
  onSearch: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  onOpenSettings: () => void;
  isAiSearching?: boolean;
}

const CATEGORIES = [
  { id: 'all', label: 'All Tracks' },
  { id: 'trending', label: 'Trending' },
  { id: 'lofi', label: 'Lo-Fi Chill' },
  { id: 'gym', label: 'Gym Energy' },
  { id: 'bollywood', label: 'Bollywood' },
  { id: 'pop', label: 'English Pop' },
  { id: 'acoustic', label: 'Acoustic' },
];

const POPULAR_RECOMMENDATIONS = [
  'Aashiqui 2 romantic songs',
  'Gym workout bass motivation',
  'Lo-Fi beats for studying',
  'Top trending Hindi songs 2026',
  'English pop acoustic hits',
];

export const Navbar: React.FC<NavbarProps> = ({
  onSearch,
  activeCategory,
  setActiveCategory,
  onOpenSettings,
  isAiSearching = false,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [liveSuggestions, setLiveSuggestions] = useState<Song[]>([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const { user, searchHistory, addSearchQuery, removeSearchQuery, clearSearchHistory } = useAuth();
  const { playSong } = usePlayer();

  // Debounced live search recommendations as user types
  useEffect(() => {
    const q = searchValue.trim();
    if (!q || q.length < 2) {
      setLiveSuggestions([]);
      setIsSearchingLive(false);
      return;
    }

    setIsSearchingLive(true);
    const timer = setTimeout(async () => {
      try {
        const cleaned = normalizeQueryTypo(q);
        const results = await api.searchMusic(cleaned, 4);
        setLiveSuggestions(results);
      } catch (err) {
        console.warn('Live search suggestions failed:', err);
      } finally {
        setIsSearchingLive(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    addSearchQuery(trimmed);
    setSearchValue(trimmed);
    setIsOpen(false);
    onSearch(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      triggerSearch(searchValue);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      triggerSearch(searchValue);
    }
  };

  const handlePlayDirect = (song: Song) => {
    playSong(song, liveSuggestions);
    addSearchQuery(searchValue || song.title);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-2.5 px-3.5 sm:px-6 pt-3 sm:pt-5 pb-2.5 select-none shrink-0 relative z-30">
      <div className="flex items-center justify-between gap-2.5 sm:gap-4 w-full">
        {/* 1. Left: Search bar with Live Direct Recommendations Dropdown */}
        <div ref={containerRef} className="relative flex-1 min-w-0 max-w-sm md:w-80">
        <form onSubmit={handleFormSubmit} className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-white/50 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search songs, moods, artists..."
            className="w-full pl-9 pr-8 py-2 bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.12] border border-white/10 focus:border-white/25 rounded-2xl text-xs text-white placeholder-white/40 focus:outline-none transition-all shadow-inner"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => {
                setSearchValue('');
                setLiveSuggestions([]);
              }}
              className="absolute right-3 p-0.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          {isAiSearching && !searchValue && (
            <Sparkles className="w-3.5 h-3.5 text-brand-purple animate-spin absolute right-3" />
          )}
        </form>

        {/* FLOATING DIRECT RECOMMENDATIONS DROPDOWN */}
        {isOpen && (
          <div className="absolute top-11 left-0 w-[calc(100vw-2rem)] max-w-sm md:w-96 glass-window rounded-2xl border border-white/15 p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-50 animate-fadeIn space-y-3">
            {/* Live Search Songs Results */}
            {searchValue.trim().length >= 2 ? (
              <div>
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10">
                  <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                    <Music2 className="w-3.5 h-3.5 text-white/80" />
                    Direct Recommendations
                  </span>
                  {isSearchingLive && (
                    <span className="text-[10px] text-white/40 animate-pulse">Searching...</span>
                  )}
                </div>

                {liveSuggestions.length > 0 ? (
                  <div className="space-y-1.5">
                    {liveSuggestions.map((song) => (
                      <div
                        key={song.videoId}
                        className="flex items-center justify-between gap-2.5 p-2 rounded-xl hover:bg-white/[0.08] transition-colors group cursor-pointer"
                        onClick={() => handlePlayDirect(song)}
                      >
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 shadow-sm">
                          <img
                            src={song.thumbnail}
                            alt={song.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Play className="w-3.5 h-3.5 fill-white text-white" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{song.title}</p>
                          <p className="text-[10px] text-white/50 truncate">{song.artist}</p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayDirect(song);
                          }}
                          className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all shrink-0"
                          title="Play now"
                        >
                          <Play className="w-3 h-3 fill-current text-black ml-0.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : !isSearchingLive ? (
                  <p className="text-xs text-white/50 py-2 text-center">
                    Press Enter to view all results for "{searchValue}"
                  </p>
                ) : null}

                {/* Quick Search Completion Pills */}
                <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap gap-1.5">
                  <button
                    onClick={() => triggerSearch(`${searchValue} songs`)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.14] text-[10px] text-white/80 hover:text-white transition-colors"
                  >
                    🔍 {searchValue} songs
                  </button>
                  <button
                    onClick={() => triggerSearch(`${searchValue} official audio`)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.14] text-[10px] text-white/80 hover:text-white transition-colors"
                  >
                    🎵 {searchValue} official audio
                  </button>
                </div>

                {/* View all search results link */}
                <button
                  onClick={() => triggerSearch(searchValue)}
                  className="w-full mt-2 py-1.5 text-center text-xs font-semibold text-white/70 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  <span>See full search results for "{searchValue}"</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            ) : (
              /* When input is empty or < 2 chars: Show Recent Searches & Trending Recommendations */
              <div>
                {/* 1. Recent Searches */}
                {searchHistory.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between pb-1 mb-1.5">
                      <span className="text-[11px] font-bold text-white/70 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-white/50" />
                        Recent Searches
                      </span>
                      <button
                        onClick={clearSearchHistory}
                        className="text-[10px] text-white/40 hover:text-white transition-colors"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {searchHistory.slice(0, 6).map((term, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs text-white/80 hover:text-white transition-colors cursor-pointer group"
                        >
                          <span onClick={() => triggerSearch(term)}>{term}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSearchQuery(term);
                            }}
                            className="text-white/30 hover:text-white/80 ml-0.5"
                            title="Remove"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Popular Recommendations */}
                <div>
                  <div className="pb-1 mb-1.5">
                    <span className="text-[11px] font-bold text-white/70 flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-white/50" />
                      Popular Recommendations
                    </span>
                  </div>

                  <div className="space-y-1">
                    {POPULAR_RECOMMENDATIONS.map((rec, idx) => (
                      <button
                        key={idx}
                        onClick={() => triggerSearch(rec)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/[0.08] text-xs text-white/80 hover:text-white transition-colors flex items-center justify-between group"
                      >
                        <span>{rec}</span>
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-white/50 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

        {/* 2. Center: Category pills (Desktop >= md) */}
        <div className="hidden md:flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white/20 text-white font-semibold shadow-inner border border-white/20'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* 3. Right: Notification bell & Profile pill */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Notification Bell with indicator */}
          <button
            onClick={onOpenSettings}
            title="Notifications & Settings"
            className="relative w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </button>

          {/* Profile Pill */}
          <div
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 sm:gap-2 pl-1 pr-2 sm:pr-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 cursor-pointer transition-all"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-purple to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm overflow-hidden">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-white/90 truncate max-w-[80px]">
              {user?.name || 'Explorer'}
            </span>
            <ChevronDown className="w-3 h-3 text-white/50" />
          </div>
        </div>
      </div>

      {/* 4. Mobile Category pills (scrolling horizontally under search on screens < md) */}
      <div className="flex md:hidden items-center gap-1.5 overflow-x-auto no-scrollbar -mx-3.5 px-3.5 py-0.5">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-[11px] transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'bg-white/[0.06] border border-white/10 text-white/70 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
