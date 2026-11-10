import React from 'react';
import { Plus, ListMusic, Sparkles } from 'lucide-react';
import { Playlist } from '../types';
import { useAuth } from '../context/AuthContext';
import { PlaylistCard } from '../components/music/PlaylistCard';
import { EmptyState } from '../components/common/EmptyState';

interface PlaylistsProps {
  onSelectPlaylist: (playlist: Playlist) => void;
  onOpenCreatePlaylist: () => void;
}

export const Playlists: React.FC<PlaylistsProps> = ({
  onSelectPlaylist,
  onOpenCreatePlaylist,
}) => {
  const { playlists } = useAuth();

  return (
    <div className="pb-36 md:pb-28 px-1 sm:px-6 pt-3 sm:pt-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
            <ListMusic className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">My Playlists</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Your personalized and AI-synthesized music libraries
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCreatePlaylist}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-tr from-brand-violet to-brand-purple text-white text-xs font-bold shadow-neon-purple active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Playlist</span>
        </button>
      </div>

      {/* Grid of Playlists */}
      {playlists.length === 0 ? (
        <EmptyState
          title="No Playlists Yet"
          description="Create your first playlist or describe a mood in AI Discover to automatically generate one!"
          actionText="Create Playlist"
          onAction={onOpenCreatePlaylist}
          icon={<ListMusic className="w-8 h-8" />}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-6">
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist._id}
              playlist={playlist}
              onSelect={onSelectPlaylist}
            />
          ))}
        </div>
      )}
    </div>
  );
};

