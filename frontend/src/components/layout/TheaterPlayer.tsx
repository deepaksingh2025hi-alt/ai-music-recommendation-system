import React, { useState } from 'react';
import {
  X,
  Heart,
  FolderPlus,
  ListMusic,
  ExternalLink,
  Sparkles,
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
  Maximize2,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth } from '../../context/AuthContext';
import { Song } from '../../types';
import { formatTime } from '../../utils/formatTime';

export interface TheaterPlayerProps {
  onOpenAddToPlaylist?: (song: Song) => void;
}

export const TheaterPlayer: React.FC<TheaterPlayerProps> = ({ onOpenAddToPlaylist }) => {
  const {
    currentSong,
    isPlaying,
    isExpanded,
    setIsExpanded,
    currentTime,
    duration,
    seekTo,
    togglePlay,
    nextSong,
    prevSong,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    volume,
    setVolumeLevel,
    isMuted,
    toggleMute,
    queue,
    queueIndex,
    playSong,
    playbackError,
  } = usePlayer();

  const { isLiked, toggleLike } = useAuth();
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  const hasSong = !!currentSong;
  const liked = currentSong ? isLiked(currentSong.videoId) : false;

  const displayTime = isSeeking ? seekValue : currentTime;
  const progressPercent = duration > 0 ? (displayTime / duration) * 100 : 0;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSeeking(true);
    setSeekValue(parseFloat(e.target.value));
  };

  const handleSeekCommit = () => {
    seekTo(seekValue);
    setIsSeeking(false);
  };

  return (
    <div
      className={
        isExpanded && hasSong
          ? 'fixed inset-0 z-50 bg-[#0e0e14]/96 backdrop-blur-3xl flex flex-col justify-between p-4 sm:p-6 md:p-10 select-none overflow-y-auto pointer-events-auto'
          : 'pointer-events-none'
      }
    >
      {/* 1. THEATER TOP HEADER (Only in Theater Mode) */}
      {isExpanded && hasSong && (
        <div className="flex items-center justify-between max-w-6xl mx-auto w-full shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/10 text-white border border-white/15 text-[11px] sm:text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-white/80" />
              <span>Now Playing</span>
            </span>
            <span className="hidden sm:inline text-xs text-white/50">Official YouTube Playback</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {currentSong && (
              <a
                href={`https://www.youtube.com/watch?v=${currentSong.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-[11px] sm:text-xs font-medium text-white border border-white/10 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Watch on YouTube</span>
                <span className="sm:hidden">YouTube</span>
              </a>
            )}

            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 sm:p-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.18] text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Minimize to mini-player"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. CENTER STAGE: VIDEO SCREEN + QUEUE */}
      <div
        className={
          isExpanded && hasSong
            ? 'my-auto py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-center max-w-6xl mx-auto w-full'
            : ''
        }
      >
        {/* Left 2 Cols: Main Video Screen */}
        <div className={isExpanded && hasSong ? 'lg:col-span-2 flex flex-col items-center w-full' : ''}>
          {/* 
            THE SINGLE CONTINUOUS YOUTUBE CONTAINER:
            - When no song: 1px invisible in bottom corner (so YouTube API can initialize)
            - When has song & mini: floating at bottom-[125px] on mobile (above mobile player & dock) and bottom-20 on desktop
            - When has song & expanded: relative aspect-video inside theater grid
            The child div with id="youtube-iframe-target" is NEVER unmounted!
          */}
          <div
            className={
              !hasSong
                ? 'fixed bottom-0 right-0 w-[1px] h-[1px] opacity-0 pointer-events-none overflow-hidden'
                : isExpanded
                ? 'relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-black pointer-events-auto z-10'
                : 'fixed bottom-[125px] md:bottom-20 right-3 sm:right-6 w-36 sm:w-52 md:w-60 aspect-video rounded-xl sm:rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black group hover:scale-105 transition-transform duration-300 pointer-events-auto z-40'
            }
          >
            {/* The physical YouTube iframe target */}
            <div id="youtube-iframe-target" className="w-full h-full" />

            {/* Hover overlay with Theater button when in mini mode */}
            {!isExpanded && hasSong && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-2 pointer-events-auto">
                <button
                  onClick={() => setIsExpanded(true)}
                  className="p-1.5 rounded-lg bg-black/80 hover:bg-white hover:text-black text-white text-xs flex items-center gap-1 shadow-md transition-colors cursor-pointer"
                  title="Expand Theater View"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold">Theater</span>
                </button>

                <a
                  href={`https://www.youtube.com/watch?v=${currentSong.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-black/80 hover:bg-white/20 text-white transition-colors"
                  title="Watch on YouTube"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Playback Error Notice */}
            {playbackError && (
              <div className="absolute inset-0 bg-[#0e0e14]/90 flex flex-col items-center justify-center p-6 text-center">
                <p className="text-rose-400 font-semibold mb-2">{playbackError}</p>
                {currentSong && (
                  <a
                    href={`https://www.youtube.com/watch?v=${currentSong.videoId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-xl flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" /> Watch on YouTube Directly
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Song Meta info underneath video in Theater Mode */}
          {isExpanded && hasSong && currentSong && (
            <div className="w-full mt-4 flex items-center justify-between">
              <div className="pr-4 min-w-0 flex-1">
                <h2 className="text-xl font-bold text-white tracking-tight truncate">
                  {currentSong.title}
                </h2>
                <p className="text-sm font-medium text-white/60 mt-0.5 truncate">
                  {currentSong.artist}
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                {onOpenAddToPlaylist && (
                  <button
                    onClick={() => onOpenAddToPlaylist(currentSong)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-white/15 bg-white/[0.08] hover:bg-white/[0.18] text-white transition-all cursor-pointer shadow-lg active:scale-95"
                    title="Add current song to playlist"
                  >
                    <FolderPlus className="w-4 h-4 text-brand-purple" />
                    <span className="text-xs font-semibold">Add to Playlist</span>
                  </button>
                )}

                <button
                  onClick={() => toggleLike(currentSong)}
                  className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                    liked
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                      : 'bg-white/[0.06] border-white/10 text-white/60 hover:text-white'
                  }`}
                  title={liked ? 'Remove from favourites' : 'Save to favourites'}
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Up Next Queue in Theater Mode */}
        {isExpanded && hasSong && (
          <div className="lg:col-span-1 glass-subcard rounded-3xl p-5 border border-white/10 h-[440px] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-white/80" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Up Next Queue ({queue.length})
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1 no-scrollbar">
              {queue.map((song, idx) => {
                const isCurrent = idx === queueIndex;
                return (
                  <div
                    key={`${song.videoId}_${idx}`}
                    onClick={() => playSong(song)}
                    className={`group flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-white/15 border border-white/20 text-white'
                        : 'hover:bg-white/[0.05] text-white/70'
                    }`}
                  >
                    <img
                      src={song.thumbnail}
                      alt={song.title}
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{song.title}</p>
                      <p className="text-[10px] text-white/50 truncate">{song.artist}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onOpenAddToPlaylist && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAddToPlaylist(song);
                          }}
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer"
                          title="Add to playlist"
                        >
                          <FolderPlus className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isCurrent && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTTOM CONTROLS BAR (Only in Theater Mode) */}
      {isExpanded && hasSong && (
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-3 shrink-0">
          {/* Progress Bar */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-white/50 font-mono w-10 text-right">
              {formatTime(displayTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={displayTime}
              onChange={handleSeekChange}
              onMouseUp={handleSeekCommit}
              onTouchEnd={handleSeekCommit}
              className="flex-1 h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
              style={{
                background: `linear-gradient(to right, #ffffff 0%, #ffffff ${progressPercent}%, rgba(255,255,255,0.15) ${progressPercent}%, rgba(255,255,255,0.15) 100%)`,
              }}
            />
            <span className="text-xs text-white/50 font-mono w-10">
              {formatTime(duration)}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  isShuffle ? 'text-white font-bold bg-white/20' : 'text-white/40 hover:text-white'
                }`}
                title={isShuffle ? 'Shuffle enabled' : 'Enable shuffle'}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={toggleRepeat}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  repeatMode !== 'off'
                    ? 'text-white font-bold bg-white/20'
                    : 'text-white/40 hover:text-white'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-4 h-4" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Main Playback Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={prevSong}
                className="p-2.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Previous song"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current text-black" />
                ) : (
                  <Play className="w-6 h-6 fill-current text-black ml-0.5" />
                )}
              </button>

              <button
                onClick={nextSong}
                className="p-2.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Next song"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
            </div>

            {/* Volume (hidden on small mobile screens where physical volume buttons are used) */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : volume < 50 ? (
                  <Volume1 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              <input
                type="range"
                min={0}
                max={100}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolumeLevel(parseInt(e.target.value, 10))}
                className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
