import React from 'react';
import { Play, Pause, Heart, MoreHorizontal, Plus } from 'lucide-react';
import { Song } from '../../types';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth } from '../../context/AuthContext';

interface SongCardProps {
  song: Song;
  onAddToPlaylist?: (song: Song) => void;
  playlistContext?: Song[];
  genreBadge?: string;
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  onAddToPlaylist,
  playlistContext,
  genreBadge = 'Music',
}) => {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const { isLiked, toggleLike } = useAuth();

  const isCurrent = currentSong?.videoId === song.videoId;
  const isPlayingThis = isCurrent && isPlaying;
  const liked = isLiked(song.videoId);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, playlistContext);
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(song);
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToPlaylist) {
      onAddToPlaylist(song);
    }
  };

  return (
    <div
      onClick={handlePlayClick}
      className={`group relative aspect-[3/4] w-full rounded-[22px] overflow-hidden cursor-pointer border transition-all duration-300 shadow-xl ${
        isCurrent
          ? 'border-white/40 ring-2 ring-brand-purple/40 scale-[1.02]'
          : 'border-white/[0.08] hover:border-white/30 hover:scale-[1.02]'
      }`}
    >
      {/* Full Card Background Image */}
      <img
        src={song.thumbnail}
        alt={song.title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Dark Gradient Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent" />
      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />

      {/* Top Header inside Card */}
      <div className="relative z-10 p-3.5 flex items-center justify-between">
        {/* Genre / Mood Pill matching reference */}
        <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-white/90">
          {genreBadge}
        </span>

        {/* Top-Right More Button */}
        <button
          onClick={handleMoreClick}
          className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Content & White Circular Play Button */}
      <div className="absolute bottom-0 inset-x-0 p-3.5 z-10 flex items-end justify-between gap-2">
        <div className="min-w-0 flex-1 pr-1">
          <h4
            className="text-xs font-bold text-white truncate group-hover:text-purple-200 transition-colors leading-snug"
            title={song.title}
          >
            {song.title}
          </h4>
          <p className="text-[10px] text-white/60 truncate mt-0.5 font-medium" title={song.artist}>
            {song.artist}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Like quick action */}
          <button
            onClick={handleLikeClick}
            className={`w-7 h-7 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all ${
              liked ? 'text-brand-pink' : 'text-white/60 hover:text-white'
            }`}
          >
            <Heart className={`w-3 h-3 ${liked ? 'fill-current' : ''}`} />
          </button>

          {/* White Circular Play Button matching reference */}
          <button
            onClick={handlePlayClick}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-black flex items-center justify-center shadow-lg active:scale-90 transition-all"
          >
            {isPlayingThis ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
