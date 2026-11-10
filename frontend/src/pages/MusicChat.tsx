import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Play,
  ListPlus,
  RotateCcw,
  Music2,
  Headphones,
  Zap,
  Coffee,
  Heart,
  Radio,
  Flame,
} from 'lucide-react';
import { Song, ChatMessage } from '../types';
import { api } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { useToast } from '../context/ToastContext';

interface MusicChatProps {
  onOpenAddToPlaylist: (song: Song) => void;
}

const STARTER_PROMPTS = [
  { icon: Flame, label: 'High-energy gym workout phonk & beats', query: 'High-energy gym workout phonk and heavy bass beats' },
  { icon: Coffee, label: 'Late-night chill lo-fi for studying', query: 'Peaceful chill lo-fi beats for late-night studying and focus' },
  { icon: Radio, label: 'Bollywood 2000s nostalgic love songs', query: 'Soulful romantic Bollywood 2000s nostalgic love songs' },
  { icon: Zap, label: 'High BPM electronic dance workout tracks', query: 'Fast tempo 140 BPM EDM tracks for running and cardio' },
  { icon: Headphones, label: 'Acoustic indie folk for a rainy day', query: 'Mellow acoustic indie folk and acoustic guitar for rainy weather' },
];

export const MusicChat: React.FC<MusicChatProps> = ({ onOpenAddToPlaylist }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hello! I am AuraBot, your personal AI Music Concierge powered by Gemini. 🎵\n\nI specialize strictly in music recommendations, artist discoveries, workout mixes, and mood curations. What sound or vibe are you in the mood for right now?",
      suggestedPrompts: [
        'Gym workout motivation songs',
        'Chill lo-fi beats for studying',
        'Top trending acoustic hits',
      ],
      timestamp: Date.now(),
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { playSong, addToQueue, currentSong, isPlaying } = usePlayer();
  const { showToast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build history for backend context
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({
          role: m.role === 'user' ? ('user' as const) : ('model' as const),
          content: m.text,
        }));

      const res = await api.chatWithMusicBot(text, history, 'guest');

      const botMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        text: res.reply,
        songs: res.songs,
        suggestedPrompts: res.suggestedPrompts,
        detectedMood: res.detectedMood,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      showToast('Error communicating with AuraBot', 'error');

      const fallbackMsg: ChatMessage = {
        id: `bot_err_${Date.now()}`,
        role: 'assistant',
        text: "I had a momentary audio glitch, but I'm back! Tell me what musical vibes you want to explore.",
        suggestedPrompts: [
          'High energy gym workout music',
          'Calm relaxing chillout acoustic',
          'Bollywood romantic songs',
        ],
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: "Chat cleared! What music vibe or playlist can I curate for you next? 🎶",
        suggestedPrompts: [
          'Heavy gym lifting soundtrack',
          'Peaceful lo-fi piano study music',
          'Bollywood retro acoustic classics',
        ],
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto py-2">
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.08] border border-white/15 flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-dark-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-bold text-white tracking-tight">
                AuraBot — AI Music Concierge
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-semibold text-white/80">
                Gemini Powered
              </span>
            </div>
            <p className="text-xs text-white/50">
              Strictly for music recommendations, playlists, and sonic moods
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs text-white/70 hover:text-white border border-white/10 transition-colors"
          title="Reset conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* 2. Messages Container */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1 pb-4">
        {/* Starter Prompts (visible when few messages) */}
        {messages.length <= 1 && (
          <div className="my-4 p-4 rounded-3xl bg-white/[0.03] border border-white/10">
            <p className="text-xs font-semibold text-white/60 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-white/80" />
              Try asking AuraBot:
            </p>
            <div className="flex flex-wrap gap-2">
              {STARTER_PROMPTS.map((starter, idx) => {
                const Icon = starter.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(starter.query)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 text-xs text-white/80 hover:text-white transition-all text-left group"
                  >
                    <Icon className="w-3.5 h-3.5 text-white/60 group-hover:text-white transition-colors" />
                    <span>{starter.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} transition-all`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl px-4 py-3 text-xs leading-relaxed shadow-lg ${
                  isUser
                    ? 'bg-white text-black font-medium rounded-tr-sm'
                    : 'glass-subcard border border-white/10 text-white/90 rounded-tl-sm'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-white/10">
                    <span className="flex items-center gap-1.5 font-bold text-[11px] text-white">
                      <Music2 className="w-3 h-3 text-white/80" />
                      AuraBot
                    </span>
                    {msg.detectedMood && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                        {msg.detectedMood}
                      </span>
                    )}
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Song Recommendations Cards inside Bot Message */}
                {msg.songs && msg.songs.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-[11px] font-bold text-white mb-2 flex items-center gap-1.5">
                      <Headphones className="w-3.5 h-3.5 text-white/80" />
                      Recommended Tracks ({msg.songs.length})
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.songs.map((song) => {
                        const isCurrent = currentSong?.videoId === song.videoId;
                        return (
                          <div
                            key={song.videoId}
                            className={`flex items-center gap-2.5 p-2 rounded-2xl border transition-all ${
                              isCurrent
                                ? 'bg-white/20 border-white/30 text-white shadow-md'
                                : 'bg-white/[0.05] hover:bg-white/[0.1] border-white/10 text-white/80'
                            }`}
                          >
                            <div className="relative group shrink-0 w-11 h-11 rounded-xl overflow-hidden shadow-sm">
                              <img
                                src={song.thumbnail}
                                alt={song.title}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => playSong(song, msg.songs)}
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                title="Play now"
                              >
                                <Play className="w-4 h-4 fill-white text-white" />
                              </button>
                            </div>

                            <div className="flex-1 min-w-0">
                              <p
                                onClick={() => playSong(song, msg.songs)}
                                className="text-xs font-semibold text-white truncate cursor-pointer hover:underline"
                                title={song.title}
                              >
                                {song.title}
                              </p>
                              <p className="text-[10px] text-white/50 truncate">
                                {song.artist}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => playSong(song, msg.songs)}
                                className="p-1.5 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-md"
                                title="Play song"
                              >
                                <Play className="w-3 h-3 fill-current text-black ml-0.5" />
                              </button>

                              <button
                                onClick={() => {
                                  addToQueue(song);
                                  showToast(`Added to queue: ${song.title}`, 'success');
                                }}
                                className="p-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.2] text-white/70 hover:text-white transition-colors"
                                title="Add to queue"
                              >
                                <ListPlus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Suggested follow-up prompt chips */}
                {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                  <div className="mt-3 pt-2 flex flex-wrap gap-1.5">
                    {msg.suggestedPrompts.map((prompt, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => handleSendMessage(prompt)}
                        className="px-2.5 py-1 rounded-xl bg-white/[0.08] hover:bg-white/[0.18] text-[10px] text-white/80 hover:text-white border border-white/10 transition-colors"
                      >
                        {prompt} →
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-[9px] text-white/30 mt-1 px-2 font-mono">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start">
            <div className="glass-subcard border border-white/10 rounded-3xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white animate-spin" />
              <span className="text-xs text-white/70">
                AuraBot is listening to the groove and picking tracks...
              </span>
              <div className="flex items-center gap-1 ml-2">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input Controls Bar: elevated cleanly above the floating player banner and mobile dock */}
      <div
        className={`pt-2 shrink-0 transition-all duration-300 ${
          currentSong ? 'pb-36 md:pb-28' : 'pb-20 md:pb-4'
        }`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center gap-2 max-w-3xl mx-auto"
        >
          <div className="relative flex-1 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask AuraBot for songs, workout music, study vibes, or artists... (Strictly Music Only)"
              disabled={isLoading}
              className="w-full pl-5 pr-12 py-3 bg-white/[0.08] hover:bg-white/[0.12] focus:bg-white/[0.15] border border-white/20 focus:border-white/40 rounded-full text-xs text-white placeholder-white/45 focus:outline-none transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-2 p-2 rounded-full bg-white text-black hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all shadow-md cursor-pointer"
              title="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        <p className="text-[10px] text-center text-white/40 mt-1.5">
          AuraBot specializes strictly in music curation. Non-music queries will be steered back to musical vibes.
        </p>
      </div>
    </div>
  );
};

