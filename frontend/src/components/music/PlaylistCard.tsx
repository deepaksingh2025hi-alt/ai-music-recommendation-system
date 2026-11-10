import React from 'react';
import { Play, Sparkles, Music } from 'lucide-react';
import { Playlist } from '../../types';
import { usePlayer } from '../../context/PlayerContext';

interface PlaylistCardProps {
  playlist: Playlist;
  onSelect: (playlist: Playlist) => void;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onSelect }) => {
  const { playPlaylist } = usePlayer();

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playlist.songs && playlist.songs.length > 0) {
      playPlaylist(playlist.songs, 0);
    } else {
      onSelect(playlist);
    }
  };

  const coverUrl =
    playlist.coverImage ||
    playlist.songs?.[0]?.thumbnail ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';

  return (
    <div
      onClick={() => onSelect(playlist)}
      className="group relative flex flex-col p-3 rounded-2xl glass-card cursor-pointer border border-white/[0.06] hover:border-brand-purple/40 transition-all duration-300"
    >
      {/* Cover image container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-dark-900 shadow-md">
        <img
          src={coverUrl}
          alt={playlist.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* AI Tag */}
        {playlist.isAiGenerated && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-brand-purple/80 backdrop-blur-md text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-1 shadow-md">
            <Sparkles className="w-2.5 h-2.5" />
            <span>AI Mix</span>
          </div>
        )}

        {/* Mood Tag */}
        {playlist.mood && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-dark-950/80 backdrop-blur-md text-[10px] font-medium text-purple-300">
            {playlist.mood}
          </div>
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-dark-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={handlePlayClick}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-violet to-brand-purple hover:scale-110 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-purple-950/60 transition-transform"
          >
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-100 line-clamp-1 group-hover:text-brand-purple transition-colors">
            {playlist.title}
          </h4>
          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
            {playlist.description || `${playlist.songs?.length || 0} tracks`}
          </p>
        </div>

        <div className="mt-2 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <Music className="w-3 h-3" />
            {playlist.songs?.length || 0} songs
          </span>
        </div>
      </div>
    </div>
  );
};

