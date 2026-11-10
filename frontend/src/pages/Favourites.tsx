import React from 'react';
import { Heart, Play, Shuffle } from 'lucide-react';
import { Song } from '../types';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { SongRow } from '../components/music/SongRow';
import { EmptyState } from '../components/common/EmptyState';

interface FavouritesProps {
  onOpenAddToPlaylist: (song: Song) => void;
  onExplore: () => void;
}

export const Favourites: React.FC<FavouritesProps> = ({ onOpenAddToPlaylist, onExplore }) => {
  const { favourites } = useAuth();
  const { playPlaylist } = usePlayer();

  const handlePlayAll = () => {
    if (favourites.length > 0) {
      playPlaylist(favourites, 0);
    }
  };

  const handleShufflePlay = () => {
    if (favourites.length > 0) {
      const shuffled = [...favourites].sort(() => Math.random() - 0.5);
      playPlaylist(shuffled, 0);
    }
  };

  return (
    <div className="pb-36 md:pb-28 px-1 sm:px-6 pt-3 sm:pt-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-violet to-brand-pink flex items-center justify-center text-white shadow-neon-purple/40">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Liked Songs
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {favourites.length} tracks you have bookmarked
            </p>
          </div>
        </div>

        {favourites.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-tr from-brand-violet to-brand-purple text-white text-xs font-bold shadow-neon-purple active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Play All</span>
            </button>
            <button
              onClick={handleShufflePlay}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-white text-xs font-semibold active:scale-95 transition-all"
            >
              <Shuffle className="w-4 h-4" />
              <span>Shuffle</span>
            </button>
          </div>
        )}
      </div>

      {/* Songs List */}
      {favourites.length === 0 ? (
        <EmptyState
          title="No Liked Songs Yet"
          description="Click the heart icon on any song to save it to your favorites."
          actionText="Discover Music"
          onAction={onExplore}
          icon={<Heart className="w-8 h-8" />}
        />
      ) : (
        <div className="glass-card rounded-2xl p-2 border border-white/[0.06] divide-y divide-white/[0.04]">
          {favourites.map((song, idx) => (
            <SongRow
              key={song.videoId}
              song={song}
              index={idx}
              onAddToPlaylist={onOpenAddToPlaylist}
              playlistContext={favourites}
            />
          ))}
        </div>
      )}
    </div>
  );
};

