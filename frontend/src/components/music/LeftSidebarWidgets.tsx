import React from 'react';
import { Play, Pause, Flame, History, ArrowUpDown } from 'lucide-react';
import { Song } from '../../types';
import { usePlayer } from '../../context/PlayerContext';

interface LeftSidebarWidgetsProps {
  trendingSongs: Song[];
  historySongs: Song[];
  onOpenAddToPlaylist?: (song: Song) => void;
}

export const LeftSidebarWidgets: React.FC<LeftSidebarWidgetsProps> = ({
  trendingSongs,
  historySongs,
}) => {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();

  const handlePlaySong = (song: Song, context: Song[]) => {
    if (currentSong?.videoId === song.videoId) {
      togglePlay();
    } else {
      playSong(song, context);
    }
  };

  return (
    <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-3.5 shrink-0 select-none order-2 lg:order-1">
      {/* 1. Top Widget: "🔥 Trending Tracks" matching "New Trailer" in reference image */}
      <div className="glass-subcard rounded-[22px] p-3.5 flex flex-col shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-2.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-white text-xs">
            <Flame className="w-3.5 h-3.5 text-brand-pink fill-current" />
            <span>Trending Tracks</span>
          </div>
          <span className="text-[10px] text-white/50 flex items-center gap-1 font-medium cursor-pointer hover:text-white">
            Sort by: <span className="text-white/80">Today</span>
            <ArrowUpDown className="w-2.5 h-2.5" />
          </span>
        </div>

        {/* Stacked Cards matching reference UI */}
        <div className="space-y-2">
          {trendingSongs.slice(0, 3).map((song) => {
            const isCurrent = currentSong?.videoId === song.videoId;
            const isPlayingThis = isCurrent && isPlaying;
            return (
              <div
                key={song.videoId}
                onClick={() => handlePlaySong(song, trendingSongs)}
                className="group flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] cursor-pointer border border-white/[0.06] hover:border-white/20 transition-all shadow-sm"
              >
                <div className="relative w-16 h-11 rounded-lg overflow-hidden shrink-0 bg-dark-900">
                  <img
                    src={song.thumbnail}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isPlayingThis && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 pr-1">
                  <p className="text-xs font-bold text-white truncate leading-tight">
                    {song.title}
                  </p>
                  <p className="text-[10px] text-white/60 truncate mt-0.5">{song.artist}</p>
                </div>

                <button className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-white group-hover:text-black flex items-center justify-center text-white/80 shrink-0 transition-all">
                  {isPlayingThis ? (
                    <Pause className="w-2.5 h-2.5 fill-current" />
                  ) : (
                    <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Bottom Widget: "Continue Listening" matching "Continue Watching" in reference image */}
      <div className="glass-subcard rounded-[22px] p-3.5 flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="flex items-center gap-1.5 font-bold text-xs text-white mb-2 shrink-0">
          <History className="w-3.5 h-3.5 text-brand-purple" />
          <span>Continue Listening</span>
        </div>

        <div className="space-y-1.5 flex-1 overflow-y-auto no-scrollbar">
          {(historySongs.length > 0 ? historySongs.slice(0, 4) : trendingSongs.slice(3, 7)).map(
            (song) => {
              const isCurrent = currentSong?.videoId === song.videoId;
              const isPlayingThis = isCurrent && isPlaying;
              return (
                <div
                  key={song.videoId}
                  onClick={() =>
                    handlePlaySong(
                      song,
                      historySongs.length > 0 ? historySongs : trendingSongs
                    )
                  }
                  className={`flex items-center justify-between p-1.5 rounded-xl cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-white/10 text-white'
                      : 'hover:bg-white/[0.05] text-white/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <img
                      src={song.thumbnail}
                      alt={song.title}
                      className="w-8 h-8 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate leading-tight">{song.title}</p>
                      <p className="text-[10px] text-white/50 truncate">{song.artist}</p>
                    </div>
                  </div>

                  <button className="w-5 h-5 rounded-full bg-white/10 hover:bg-white hover:text-black flex items-center justify-center text-white/70 transition-all shrink-0 ml-1">
                    {isPlayingThis ? (
                      <Pause className="w-2 h-2 fill-current" />
                    ) : (
                      <Play className="w-2 h-2 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
};
