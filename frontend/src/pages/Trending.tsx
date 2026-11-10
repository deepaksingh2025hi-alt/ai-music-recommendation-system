import React, { useState, useEffect } from 'react';
import { Flame, Play, LayoutGrid, List, Sparkles } from 'lucide-react';
import { Song } from '../types';
import { api } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { SongCard } from '../components/music/SongCard';
import { SongRow } from '../components/music/SongRow';
import { SkeletonCard, SkeletonRow } from '../components/common/SkeletonCard';

interface TrendingProps {
  onOpenAddToPlaylist: (song: Song) => void;
}

const REGIONS = [
  { code: 'IN', label: 'India' },
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
];

export const Trending: React.FC<TrendingProps> = ({ onOpenAddToPlaylist }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [region, setRegion] = useState('IN');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  const { playPlaylist } = usePlayer();

  useEffect(() => {
    fetchTrending(region);
  }, [region]);

  const fetchTrending = async (reg: string) => {
    try {
      setLoading(true);
      const data = await api.getTrending(reg, 20);
      setSongs(data);
    } catch (err) {
      console.error(err);
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
    <div className="pb-36 md:pb-28 px-1 sm:px-6 pt-3 sm:pt-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-brand-pink fill-current" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Trending Music</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time viral hits and top music tracks on YouTube
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Region selector */}
          <div className="flex items-center p-1 rounded-2xl bg-dark-900 border border-white/[0.08]">
            {REGIONS.map((r) => (
              <button
                key={r.code}
                onClick={() => setRegion(r.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  region === r.code
                    ? 'bg-brand-purple text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center p-1 rounded-2xl bg-dark-900 border border-white/[0.08]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition-all ${
                viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-xl transition-all ${
                viewMode === 'list' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Play All */}
          <button
            onClick={handlePlayAll}
            disabled={songs.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-tr from-brand-violet to-brand-purple text-white text-xs font-bold shadow-neon-purple active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            <span>Play Top 20</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 15 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        )
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {songs.map((song) => (
            <SongCard
              key={song.videoId}
              song={song}
              onAddToPlaylist={onOpenAddToPlaylist}
              playlistContext={songs}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-2 border border-white/[0.06] divide-y divide-white/[0.04]">
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

