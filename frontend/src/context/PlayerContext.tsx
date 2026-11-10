import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Song } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT: any;
  }
}

export type RepeatMode = 'off' | 'all' | 'one';

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  isBuffering: boolean;
  queue: Song[];
  queueIndex: number;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  isExpanded: boolean;
  isQueueOpen: boolean;
  playbackError: string | null;

  playSong: (song: Song, newQueue?: Song[]) => void;
  playPlaylist: (songs: Song[], startIndex?: number) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seekTo: (seconds: number) => void;
  setVolumeLevel: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setIsExpanded: (expanded: boolean) => void;
  setIsQueueOpen: (open: boolean) => void;
  setPlaybackError: (err: string | null) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(-1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const playerRef = useRef<any>(null);
  const isApiReadyRef = useRef<boolean>(false);
  const timerRef = useRef<any>(null);

  const { addSongToHistory } = useAuth();
  const { showToast } = useToast();

  // Initialize YouTube IFrame API
  useEffect(() => {
    const initYT = () => {
      if (window.YT && window.YT.Player) {
        isApiReadyRef.current = true;
        createPlayer();
      } else {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
          isApiReadyRef.current = true;
          createPlayer();
        };
      }
    };

    const createPlayer = () => {
      const container = document.getElementById('youtube-iframe-target');
      if (!container || playerRef.current) return;

      playerRef.current = new window.YT.Player('youtube-iframe-target', {
        height: '100%',
        width: '100%',
        videoId: '',
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          fs: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(volume);
            if (isMuted) event.target.mute();
          },
          onStateChange: (event: any) => {
            handlePlayerStateChange(event.data);
          },
          onError: (event: any) => {
            handlePlayerError(event.data);
          },
        },
      });
    };

    initYT();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Poll current playback time and duration smoothly
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const curr = playerRef.current.getCurrentTime() || 0;
          const dur = playerRef.current.getDuration() || 0;
          setCurrentTime(curr);
          if (dur > 0 && dur !== duration) {
            setDuration(dur);
          }
        }
      }, 300);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, duration]);

  const handlePlayerStateChange = (state: number) => {
    // YT.PlayerState: -1 = unstarted, 0 = ended, 1 = playing, 2 = paused, 3 = buffering, 5 = cued
    if (state === 1) {
      setIsPlaying(true);
      setIsBuffering(false);
      setPlaybackError(null);
      if (playerRef.current?.getDuration) {
        setDuration(playerRef.current.getDuration() || 0);
      }
    } else if (state === 2) {
      setIsPlaying(false);
      setIsBuffering(false);
    } else if (state === 3) {
      setIsBuffering(true);
    } else if (state === 0) {
      // Song ended!
      setIsPlaying(false);
      setIsBuffering(false);
      handleSongEnded();
    }
  };

  const handlePlayerError = (code: number) => {
    console.warn('YouTube Player Error code:', code);
    setIsBuffering(false);
    let message = 'Unable to play this video.';
    if (code === 101 || code === 150) {
      message = 'Video owner restricts external embedding. Skipping to next song...';
    } else if (code === 100) {
      message = 'Video not found or removed.';
    }
    setPlaybackError(message);
    showToast(message, 'error');

    // Auto skip after 1.5 seconds if error is non-embeddable
    setTimeout(() => {
      nextSong();
    }, 1500);
  };

  const handleSongEnded = () => {
    if (repeatMode === 'one') {
      if (playerRef.current?.seekTo) {
        playerRef.current.seekTo(0);
        playerRef.current.playVideo();
      }
    } else {
      nextSong();
    }
  };

  const loadVideo = (song: Song) => {
    setCurrentSong(song);
    setCurrentTime(0);
    setPlaybackError(null);
    addSongToHistory(song);

    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      try {
        playerRef.current.loadVideoById(song.videoId);
        setIsPlaying(true);
      } catch (err) {
        console.error('Failed to load video by ID:', err);
      }
    }
  };

  const playSong = (song: Song, newQueue?: Song[]) => {
    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
      const idx = newQueue.findIndex((s) => s.videoId === song.videoId);
      setQueueIndex(idx !== -1 ? idx : 0);
    } else {
      // Add or use existing queue
      const existingIdx = queue.findIndex((s) => s.videoId === song.videoId);
      if (existingIdx !== -1) {
        setQueueIndex(existingIdx);
      } else {
        setQueue((prev) => [song, ...prev]);
        setQueueIndex(0);
      }
    }
    loadVideo(song);
  };

  const playPlaylist = (songs: Song[], startIndex: number = 0) => {
    if (!songs || songs.length === 0) return;
    let effectiveSongs = [...songs];
    if (isShuffle) {
      effectiveSongs = [...songs].sort(() => Math.random() - 0.5);
    }
    setQueue(effectiveSongs);
    const validIndex = Math.min(Math.max(startIndex, 0), effectiveSongs.length - 1);
    setQueueIndex(validIndex);
    loadVideo(effectiveSongs[validIndex]);
    showToast(`Playing playlist (${songs.length} tracks)`, 'success');
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (!currentSong) {
      if (queue.length > 0) {
        playSong(queue[0]);
      }
      return;
    }

    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const nextSong = () => {
    if (queue.length === 0) return;

    let nextIdx = queueIndex + 1;
    if (nextIdx >= queue.length) {
      if (repeatMode === 'all') {
        nextIdx = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    setQueueIndex(nextIdx);
    loadVideo(queue[nextIdx]);
  };

  const prevSong = () => {
    if (queue.length === 0) return;

    // If more than 3 seconds into song, restart song
    if (currentTime > 3 && playerRef.current?.seekTo) {
      playerRef.current.seekTo(0);
      return;
    }

    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = repeatMode === 'all' ? queue.length - 1 : 0;
    }

    setQueueIndex(prevIdx);
    loadVideo(queue[prevIdx]);
  };

  const seekTo = (seconds: number) => {
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(seconds, true);
      setCurrentTime(seconds);
    }
  };

  const setVolumeLevel = (vol: number) => {
    const clamped = Math.max(0, Math.min(100, vol));
    setVolume(clamped);
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(clamped);
    }
    if (isMuted && clamped > 0) {
      setIsMuted(false);
      playerRef.current?.unMute();
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const toggleShuffle = () => {
    setIsShuffle((prev) => {
      const next = !prev;
      showToast(next ? 'Shuffle enabled' : 'Shuffle disabled', 'info');
      return next;
    });
  };

  const toggleRepeat = () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const nextMode = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
    setRepeatMode(nextMode);
    showToast(
      nextMode === 'one' ? 'Repeat current song' : nextMode === 'all' ? 'Repeat all tracks' : 'Repeat off',
      'info'
    );
  };

  const addToQueue = (song: Song) => {
    setQueue((prev) => [...prev, song]);
    showToast(`Added "${song.title.substring(0, 25)}..." to queue`, 'success');
  };

  const removeFromQueue = (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
    if (index === queueIndex) {
      nextSong();
    } else if (index < queueIndex) {
      setQueueIndex((prev) => prev - 1);
    }
  };

  const clearQueue = () => {
    setQueue(currentSong ? [currentSong] : []);
    setQueueIndex(currentSong ? 0 : -1);
    showToast('Queue cleared', 'info');
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        isBuffering,
        queue,
        queueIndex,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        isExpanded,
        isQueueOpen,
        playbackError,
        playSong,
        playPlaylist,
        togglePlay,
        nextSong,
        prevSong,
        seekTo,
        setVolumeLevel,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        addToQueue,
        removeFromQueue,
        clearQueue,
        setIsExpanded,
        setIsQueueOpen,
        setPlaybackError,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
};

