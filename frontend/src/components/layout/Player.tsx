import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  FolderPlus,
  ListMusic,
  Maximize2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth } from '../../context/AuthContext';
import { Song } from '../../types';
import { formatTime } from '../../utils/formatTime';

export interface PlayerProps {
  onOpenAddToPlaylist?: (song: Song) => void;
}

export const Player: React.FC<PlayerProps> = ({ onOpenAddToPlaylist }) => {
  const {
    currentSong,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    isQueueOpen,
    isExpanded,
    togglePlay,
    nextSong,
    prevSong,
    seekTo,
    setVolumeLevel,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    setIsExpanded,
    setIsQueueOpen,
  } = usePlayer();

  const { isLiked, toggleLike } = useAuth();
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSeeking(true);
    setSeekValue(parseFloat(e.target.value));
  };

  const handleSeekCommit = () => {
    seekTo(seekValue);
    setIsSeeking(false);
  };

  if (!currentSong || isExpanded) {
    return null;
  }

  // 1. Minimized Micro-Capsule (Compact pill when user wants maximum screen space)
  if (isMinimized) {
    return (
      <div className="fixed bottom-[58px] md:bottom-3 left-1/2 -translate-x-1/2 glass-dock rounded-full px-3 py-1.5 z-40 flex items-center gap-2.5 shadow-2xl border border-white/20 select-none backdrop-blur-xl animate-fadeIn">
        <img
          src={currentSong.thumbnail}
          alt={currentSong.title}
          className="w-6 h-6 rounded-full object-cover border border-white/25"
        />
        <div className="max-w-[140px] overflow-hidden">
          <p
            onClick={() => setIsExpanded(true)}
            className="text-[11px] font-semibold text-white truncate cursor-pointer hover:underline"
            title={currentSong.title}
          >
            {currentSong.title}
          </p>
        </div>

        <button
          onClick={togglePlay}
          className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-3 h-3 fill-current text-black" />
          ) : (
            <Play className="w-3 h-3 fill-current text-black ml-0.5" />
          )}
        </button>

        {onOpenAddToPlaylist && (
          <button
            onClick={() => onOpenAddToPlaylist(currentSong)}
            className="p-1 rounded-full text-white/50 hover:text-white transition-colors cursor-pointer"
            title="Add to playlist"
          >
            <FolderPlus className="w-3 h-3" />
          </button>
        )}

        <button
          onClick={() => setIsMinimized(false)}
          className="p-1 rounded-full text-white/60 hover:text-white transition-colors cursor-pointer"
          title="Expand player banner"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  const liked = isLiked(currentSong.videoId);

  return (
    <div className="fixed bottom-[56px] md:bottom-4 left-1/2 -translate-x-1/2 w-[95vw] md:w-[92vw] max-w-4xl glass-dock rounded-2xl md:rounded-full px-3.5 md:px-5 py-2 z-40 shadow-2xl border border-white/15 select-none overflow-hidden">
      {/* Top thin progress bar on mobile */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-[2px] bg-white/10">
        <div
          className="h-full bg-white transition-all duration-200"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* MOBILE MINI-PLAYER VIEW (< md) */}
      <div className="flex md:hidden items-center justify-between gap-2.5 w-full">
        {/* Left: Thumbnail & Title (Tapping opens Theater Player) */}
        <div
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
        >
          <div className="relative shrink-0">
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              className="w-9 h-9 rounded-full object-cover border border-white/20 shadow-md"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center gap-0.5">
                <span className="w-0.5 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-0.5 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-0.5 h-1.5 bg-white rounded-full animate-bounce" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white truncate">
              {currentSong.title}
            </h4>
            <p className="text-[10px] text-white/60 truncate">
              {currentSong.artist}
            </p>
          </div>
        </div>

        {/* Right: Quick Touch Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => toggleLike(currentSong)}
            className={`p-1.5 rounded-full transition-all active:scale-90 ${
              liked ? 'text-brand-pink' : 'text-white/40 hover:text-white'
            }`}
            title={liked ? 'Unlike' : 'Like'}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          </button>

          {onOpenAddToPlaylist && (
            <button
              onClick={() => onOpenAddToPlaylist(currentSong)}
              className="p-1.5 rounded-full text-white/50 hover:text-white transition-colors cursor-pointer"
              title="Add to playlist"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={togglePlay}
            disabled={isBuffering}
            className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer ml-0.5"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current text-black" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current text-black ml-0.5" />
            )}
          </button>

          <button
            onClick={nextSong}
            className="p-1.5 text-white/70 hover:text-white transition-colors active:scale-90"
            title="Next Track"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={() => setIsExpanded(true)}
            className="p-1.5 text-white/50 hover:text-white transition-colors cursor-pointer"
            title="Open Fullscreen Theater"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* DESKTOP VIEW (>= md) */}
      <div className="hidden md:flex items-center justify-between gap-4 w-full">
        {/* 1. Left: Track Metadata */}
        <div className="flex items-center gap-3 min-w-[180px] max-w-[240px]">
          <div className="relative group shrink-0">
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              className="w-10 h-10 rounded-full object-cover border border-white/20 shadow-md group-hover:scale-105 transition-transform"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center gap-0.5">
                <span className="w-0.5 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-0.5 h-3.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-0.5 h-1.5 bg-white rounded-full animate-bounce" />
              </div>
            )}
          </div>

          <div className="overflow-hidden">
            <h4
              className="text-xs font-bold text-white truncate hover:text-purple-300 transition-colors cursor-pointer"
              title={currentSong.title}
              onClick={() => setIsExpanded(true)}
            >
              {currentSong.title}
            </h4>
            <p className="text-[10px] text-white/60 truncate" title={currentSong.artist}>
              {currentSong.artist}
            </p>
          </div>

          <button
            onClick={() => toggleLike(currentSong)}
            className={`p-1.5 rounded-full transition-all active:scale-90 ${
              liked ? 'text-brand-pink' : 'text-white/40 hover:text-white'
            }`}
            title={liked ? 'Unlike' : 'Like'}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
          </button>

          {onOpenAddToPlaylist && (
            <button
              onClick={() => onOpenAddToPlaylist(currentSong)}
              className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/[0.1] transition-all cursor-pointer"
              title="Add playing song to playlist"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2. Center: Controls & Scrubbing Bar */}
        <div className="flex-1 max-w-lg flex flex-col items-center gap-1">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleShuffle}
              className={`p-1 rounded-full transition-colors ${
                isShuffle ? 'text-brand-cyan' : 'text-white/40 hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={prevSong}
              className="p-1 text-white/70 hover:text-white transition-colors active:scale-90"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            {/* White Circular Play Button matching reference */}
            <button
              onClick={togglePlay}
              disabled={isBuffering}
              className="w-9 h-9 rounded-full bg-white hover:bg-slate-200 text-black flex items-center justify-center shadow-lg active:scale-95 transition-all"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={nextSong}
              className="p-1 text-white/70 hover:text-white transition-colors active:scale-90"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-1 rounded-full transition-colors ${
                repeatMode !== 'off' ? 'text-brand-purple' : 'text-white/40 hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Progress scrub bar */}
          <div className="w-full flex items-center gap-2">
            <span className="text-[9px] text-white/50 w-7 text-right font-mono">
              {formatTime(isSeeking ? seekValue : currentTime)}
            </span>

            <div className="relative flex-1 flex items-center cursor-pointer">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={1}
                value={isSeeking ? seekValue : currentTime}
                onChange={handleSeekChange}
                onMouseUp={handleSeekCommit}
                onTouchEnd={handleSeekCommit}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white focus:outline-none"
                style={{
                  background: `linear-gradient(to right, #ffffff 0%, #ffffff ${progressPercent}%, rgba(255,255,255,0.15) ${progressPercent}%, rgba(255,255,255,0.15) 100%)`,
                }}
              />
            </div>

            <span className="text-[9px] text-white/50 w-7 font-mono">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* 3. Right: Volume, Queue, Video Expand */}
        <div className="flex items-center gap-2 min-w-[150px] justify-end">
          {/* Volume */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="text-white/60 hover:text-white p-1 transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : volume < 50 ? (
                <Volume1 className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolumeLevel(parseInt(e.target.value, 10))}
              className="w-14 h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          {/* Queue button */}
          <button
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            className={`p-1.5 rounded-full transition-all ${
              isQueueOpen
                ? 'bg-white text-black'
                : 'text-white/60 hover:text-white hover:bg-white/[0.1]'
            }`}
            title="Up Next Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Video Theater Button */}
          <button
            onClick={() => setIsExpanded(true)}
            className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/[0.1] transition-all cursor-pointer"
            title="Open Theater Mode"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Minimize Banner Button */}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/[0.1] transition-all cursor-pointer"
            title="Minimize player banner"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
