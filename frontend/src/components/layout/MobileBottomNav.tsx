import React from 'react';
import { Home, Bot, Sparkles, Flame, ListMusic, PlusCircle } from 'lucide-react';

export interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
  onOpenCreatePlaylist: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenCreatePlaylist,
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'AuraBot', icon: Bot, isAi: true },
    { id: 'discover', label: 'Discover', icon: Sparkles },
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'playlists', label: 'Library', icon: ListMusic },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#16151f]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1 flex items-center justify-around select-none shadow-[0_-10px_30px_rgba(0,0,0,0.7)] safe-area-pb">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all relative ${
              isActive
                ? 'text-white'
                : 'text-white/50 hover:text-white/80 active:scale-95'
            }`}
          >
            {item.isAi ? (
              <div
                className={`relative p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-tr from-brand-purple to-indigo-500 text-white shadow-md shadow-purple-500/25 scale-105'
                    : 'bg-white/[0.08] text-purple-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            ) : (
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-white/15 text-white scale-105' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
            )}
            <span
              className={`text-[10px] font-medium mt-0.5 tracking-tight ${
                isActive ? 'text-white font-bold' : 'text-white/50'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}

      {/* Quick Add Playlist shortcut on mobile */}
      <button
        onClick={onOpenCreatePlaylist}
        className="flex flex-col items-center justify-center py-1 px-2 text-white/50 hover:text-brand-purple active:scale-95 transition-all"
        title="Create Playlist"
      >
        <div className="p-1.5 rounded-xl hover:bg-white/10">
          <PlusCircle className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-medium mt-0.5 text-white/50">New</span>
      </button>
    </nav>
  );
};
