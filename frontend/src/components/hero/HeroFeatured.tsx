import React from 'react';
import { Play, Flame, BookmarkPlus, MoreHorizontal, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Playlist, Song } from '../../types';
import { usePlayer } from '../../context/PlayerContext';

interface HeroFeaturedProps {
  playlist: Playlist | null;
  onExplore: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({
  playlist,
  onExplore,
  onPrev,
  onNext,
}) => {
  const { playPlaylist } = usePlayer();

  if (!playlist) return null;

  const handlePlay = () => {
    if (playlist.songs && playlist.songs.length > 0) {
      playPlaylist(playlist.songs, 0);
    }
  };

  const coverImage =
    playlist.coverImage ||
    playlist.songs?.[0]?.thumbnail ||
    'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1200&auto=format&fit=crop&q=80';

  return (
    <div className="relative rounded-[24px] overflow-hidden border border-white/10 shadow-xl h-[230px] lg:h-[250px] shrink-0 group select-none">
      {/* Background artwork */}
      <img
        src={coverImage}
        alt={playlist.title}
        className="absolute inset-0 w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-700"
      />

      {/* Dark Vignette & Gradient Overlays like reference */}
      <div className="absolute inset-0 bg-gradient-to-r from-dark-950/95 via-dark-950/75 to-transparent w-full md:w-3/4" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-transparent to-transparent" />

      {/* Content inside Hero Card */}
      <div className="relative z-10 h-full p-5 md:p-6 flex flex-col justify-between max-w-xl">
        {/* Top Badges */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-[11px] font-bold text-white shadow-sm">
            <Flame className="w-3.5 h-3.5 text-brand-pink fill-current" />
            <span>Now Trending</span>
          </span>

          {playlist.mood && (
            <span className="px-3 py-1 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/10 text-[11px] font-medium text-white/80">
              {playlist.mood}
            </span>
          )}

          <span className="px-3 py-1 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/10 text-[11px] font-medium text-white/80">
            {playlist.songs?.length || 0} Tracks
          </span>
        </div>

        {/* Center Title & Description */}
        <div className="space-y-1.5 my-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight line-clamp-1">
            {playlist.title}
          </h2>
          <p className="text-xs text-white/70 line-clamp-2 leading-relaxed max-w-lg font-normal">
            {playlist.description ||
              'A curated high-fidelity soundscape selected by AI to elevate your focus, flow, and emotions.'}
          </p>
        </div>

        {/* Bottom Actions & Carousel Arrows */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* White Pill Play Button like reference */}
            <button
              onClick={handlePlay}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-200 text-black font-bold text-xs shadow-xl active:scale-95 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              <span>Watch / Play</span>
            </button>

            {/* Frosted Explore / Curate Button */}
            <button
              onClick={onExplore}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.1] hover:bg-white/[0.18] border border-white/15 text-white font-semibold text-xs transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
              <span>AI Curate</span>
            </button>

            {/* More Menu Pill */}
            <button
              onClick={onExplore}
              className="w-8 h-8 rounded-full bg-white/[0.1] hover:bg-white/[0.18] border border-white/15 flex items-center justify-center text-white transition-all"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Carousel Arrows in Bottom Right matching reference */}
          {(onPrev || onNext) && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onPrev}
                className="w-7 h-7 rounded-full bg-white/[0.12] hover:bg-white/[0.25] border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onNext}
                className="w-7 h-7 rounded-full bg-white/[0.12] hover:bg-white/[0.25] border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition-all"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
