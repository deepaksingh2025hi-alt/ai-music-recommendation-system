import React from 'react';
import {
  Home,
  Bot,
  Sparkles,
  Heart,
  ListMusic,
  History,
  Settings,
  Flame,
  PlusCircle,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
  onOpenCreatePlaylist: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenCreatePlaylist,
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'AI Music Bot', icon: Bot },
    { id: 'discover', label: 'AI Discover', icon: Sparkles },
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'liked', label: 'Liked Songs', icon: Heart },
    { id: 'playlists', label: 'Playlists', icon: ListMusic },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <aside className="hidden md:flex my-auto z-30 shrink-0">
      {/* Floating Capsule Pill Dock matching reference image */}
      <div className="glass-dock rounded-full py-4 px-2.5 flex flex-col items-center gap-3.5 shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 group ${
                isActive
                  ? 'bg-white text-black shadow-lg scale-105'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.1]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {/* Tooltip on hover */}
              <span className="absolute left-12 px-2.5 py-1 rounded-xl bg-dark-900/90 text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10 z-50">
                {item.label}
              </span>
            </button>
          );
        })}

        <div className="w-5 h-[1px] bg-white/15 my-1" />

        {/* Create playlist quick button */}
        <button
          onClick={onOpenCreatePlaylist}
          title="Create Playlist"
          className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-brand-purple hover:bg-white/[0.1] transition-all group relative"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="absolute left-12 px-2.5 py-1 rounded-xl bg-dark-900/90 text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10 z-50">
            New Playlist
          </span>
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          title="Settings"
          className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.1] transition-all group relative"
        >
          <Settings className="w-4 h-4" />
          <span className="absolute left-12 px-2.5 py-1 rounded-xl bg-dark-900/90 text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10 z-50">
            Settings & Keys
          </span>
        </button>
      </div>
    </aside>
  );
};
