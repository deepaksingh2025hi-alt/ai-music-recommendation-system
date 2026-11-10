import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Play, LayoutGrid, List, Flame } from 'lucide-react';
import { Song, AIAnalysis } from '../types';
import { api } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { SongCard } from '../components/music/SongCard';
import { normalizeQueryTypo } from '../utils/queryNormalizer';
import { SongRow } from '../components/music/SongRow';
import { SkeletonCard, SkeletonRow } from '../components/common/SkeletonCard';

interface SearchResultsProps {
  query: string;
  onOpenAddToPlaylist: (song: Song) => void;
  onNavigateTab: (tab: string) => void;
}

// Fallback high-fidelity trending tracks so search page NEVER looks empty
const FALLBACK_POPULAR_SONGS: Song[] = [
  {
    videoId: 'ApXoWvfEYVU',
    title: 'Sunflower - Spider-Man: Into the Spider-Verse',
    artist: 'Post Malone, Swae Lee',
    thumbnail: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&auto=format&fit=crop&q=80',
    duration: '2:38',
    channelTitle: 'Post Malone',
  },
  {
    videoId: 'c_lGZvd_Z00',
    title: 'The Flash (2023) - Run Theme',
    artist: 'Benjamin Wallfisch',
    thumbnail: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
    duration: '3:10',
    channelTitle: 'WaterTower Music',
  },
  {
    videoId: '1V_xRb0x9aw',
    title: 'Interstellar - Cornfield Chase',
    artist: 'Hans Zimmer',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    duration: '2:06',
    channelTitle: 'WaterTower Music',
  },
  {
    videoId: 'hfd85uE-e64',
    title: 'Elemental - Steal The Show',
    artist: 'Lauv',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    duration: '3:11',
    channelTitle: 'DisneyMusicVEVO',
  },
  {
    videoId: 'sAzlWScHTc4',
    title: 'Kesariya - Brahmāstra',
    artist: 'Pritam, Arijit Singh',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    duration: '4:28',
    channelTitle: 'Sony Music India',
  },
  {
    videoId: 'BddP6PYo2gs',
    title: 'Apna Bana Le - Bhediya',
    artist: 'Arijit Singh, Sachin-Jigar',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    duration: '4:21',
    channelTitle: 'Zee Music Company',
  },
  {
    videoId: 'jfKfPfyJRdk',
    title: 'lofi hip hop radio - beats to relax/study to',
    artist: 'Lofi Girl',
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    duration: 'Live',
    channelTitle: 'Lofi Girl',
  },
  {
    videoId: '4H0JDomvPac',
    title: 'Transformers - Arrival To Earth',
    artist: 'Steve Jablonsky',
    thumbnail: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80',
    duration: '5:27',
    channelTitle: 'Steve Jablonsky',
  },
];

export const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  onOpenAddToPlaylist,
  onNavigateTab,
}) => {
  const [songs, setSongs] = useState<Song[]>(FALLBACK_POPULAR_SONGS);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);

  const { playPlaylist } = usePlayer();
  const { addSearchQuery } = useAuth();

  useEffect(() => {
    if (query && query.trim()) {
      addSearchQuery(query.trim());
      performSearch(query.trim());
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    try {
      setLoading(true);
      const cleanQuery = normalizeQueryTypo(searchQuery);

      const [rec, directSongs] = await Promise.all([
        api.recommendMusic(cleanQuery, 'guest').catch(() => null),
        api.searchMusic(cleanQuery, 20).catch(() => []),
      ]);

      const isJukebox = (s: Song) => {
        const t = (s.title || '').toLowerCase();
        const d = s.duration || '';
        const hasKeyword = /\b(jukebox|all songs|full album|full songs|audio jukebox|video jukebox|movie songs jukebox|complete album|mega mix|discography|all video songs)\b/i.test(t);
        const isLong = d.includes(':') && (d.split(':').length > 2 || parseInt(d.split(':')[0], 10) >= 8);
        return hasKeyword || isLong;
      };

      const songMap = new Map<string, Song>();

      // 1. Curated AI top hit standalone songs ALWAYS take first priority!
      if (rec && rec.songs && rec.songs.length > 0) {
        for (const s of rec.songs) {
          if (!isJukebox(s) && !songMap.has(s.videoId)) {
            songMap.set(s.videoId, s);
          }
        }
        setAiAnalysis(rec.analysis);
      }

      // 2. Direct standalone song matches from YouTube
      if (directSongs && directSongs.length > 0) {
        for (const s of directSongs) {
          if (!isJukebox(s) && !songMap.has(s.videoId)) {
            songMap.set(s.videoId, s);
          }
        }
      }

      // 3. Fallback: Any remaining tracks appended at the very end
      if (directSongs && directSongs.length > 0) {
        for (const s of directSongs) {
          if (!songMap.has(s.videoId)) {
            songMap.set(s.videoId, s);
          }
        }
      }

      const merged = Array.from(songMap.values());
      if (merged.length > 0) {
        setSongs(merged);
      }
    } catch (e: any) {
      console.warn('Search error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playPlaylist(songs, 0);
    }
  };

  return (
    <div className="pb-36 md:pb-28 max-w-7xl mx-auto space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white/[0.08] text-white border border-white/10">
              <Search className="w-4 h-4" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                {query ? `Search: "${query}"` : 'Discover Music'}
              </h1>
              <p className="text-xs text-white/50 mt-0.5">
                {songs.length} audio tracks and recommendations ready to stream
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View toggle */}
          <div className="flex items-center p-1 rounded-full bg-white/[0.06] border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition-all ${
                viewMode === 'grid' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-full transition-all ${
                viewMode === 'list' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handlePlayAll}
            disabled={songs.length === 0}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-white hover:bg-slate-200 text-black text-xs font-bold shadow-lg active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            <span>Play All</span>
          </button>
        </div>
      </div>

      {/* AI Interpretation Pill Bar (if analyzed) */}
      {aiAnalysis && (
        <div className="glass-subcard p-3.5 rounded-2xl border border-white/15 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Sparkles className="w-3.5 h-3.5 text-brand-purple" /> AI Mood Analysis:
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-white text-xs font-medium border border-white/10">
              Mood: {aiAnalysis.mood}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-white text-xs font-medium border border-white/10">
              Genre: {aiAnalysis.genre}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-white text-xs font-medium border border-white/10">
              Energy: {aiAnalysis.energy}
            </span>
          </div>
          <span className="text-[11px] text-white/50 font-medium">
            Strict Music Audio Catalog
          </span>
        </div>
      )}

      {/* Songs Grid / List */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {songs.map((song, idx) => (
              <SongCard
                key={song.videoId}
                song={song}
                onAddToPlaylist={onOpenAddToPlaylist}
                playlistContext={songs}
                genreBadge={['Acoustic', 'Fantasy', 'Animation', 'Sci-fi', 'Bollywood', 'Lo-Fi'][idx % 6]}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-subcard rounded-2xl p-2 border border-white/10 divide-y divide-white/[0.06]">
          {songs.map((song, idx) => (
            <SongRow
              key={song.videoId}
              song={song}
              index={idx}
              onAddToPlaylist={onOpenAddToPlaylist}
              playlistContext={songs}
            />
          ))}
        </div>
      )}
    </div>
  );
};
