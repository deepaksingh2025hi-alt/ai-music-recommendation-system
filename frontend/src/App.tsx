import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Player } from './components/layout/Player';
import { TheaterPlayer } from './components/layout/TheaterPlayer';
import { QueueDrawer } from './components/music/QueueDrawer';
import { AddToPlaylistModal } from './components/music/AddToPlaylistModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { CreatePlaylistModal } from './components/modals/CreatePlaylistModal';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Discover } from './pages/Discover';
import { MusicChat } from './pages/MusicChat';
import { Trending } from './pages/Trending';
import { Playlists } from './pages/Playlists';
import { PlaylistDetail } from './pages/PlaylistDetail';
import { Favourites } from './pages/Favourites';
import { History } from './pages/History';
import { SearchResults } from './pages/SearchResults';

import { Song, Playlist } from './types';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [songForPlaylist, setSongForPlaylist] = useState<Song | null>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveTab('search');
  };

  const handleSelectPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setActiveTab('playlist-detail');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-stretch p-0 md:p-3.5 select-none gap-0 md:gap-3">
      {/* 1. Realistic Blurred Room Background (matching reference image) */}
      <div className="reference-bg pointer-events-none" />

      {/* 2. Main Stage: Floating Sidebar Capsule Dock + Main Glass Window (Fills screen) */}
      <div className="relative z-10 w-full h-full flex items-stretch gap-0 md:gap-3 min-w-0">
        {/* Left Floating Capsule Sidebar Dock (Hidden on mobile) */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab !== 'playlist-detail') setSelectedPlaylist(null);
            setActiveTab(tab);
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
        />

        {/* Main Floating Frosted Glass Window */}
        <div className="flex-1 h-full glass-window rounded-none md:rounded-[32px] border-0 md:border overflow-hidden flex flex-col relative shadow-[0_30px_90px_rgba(0,0,0,0.7)]">
          {/* Top Navbar */}
          <Navbar
            onSearch={handleSearch}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          {/* Body Content inside the Glass Window */}
          <main
            className={`flex-1 px-3.5 sm:px-5 relative ${
              activeTab === 'chat'
                ? 'overflow-hidden flex flex-col pb-0'
                : 'overflow-y-auto no-scrollbar pb-24 md:pb-5'
            }`}
          >
            {activeTab === 'home' && (
              <Dashboard
                onSelectPlaylist={handleSelectPlaylist}
                onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
                onOpenAddToPlaylist={(song) => setSongForPlaylist(song)}
                onNavigateTab={setActiveTab}
                onTriggerSearch={handleSearch}
                activeCategory={activeCategory}
              />
            )}

            {activeTab === 'chat' && (
              <MusicChat onOpenAddToPlaylist={(song) => setSongForPlaylist(song)} />
            )}

            {activeTab === 'discover' && (
              <Discover
                onOpenAddToPlaylist={(song) => setSongForPlaylist(song)}
                onSelectPlaylist={handleSelectPlaylist}
              />
            )}

            {activeTab === 'trending' && (
              <Trending onOpenAddToPlaylist={(song) => setSongForPlaylist(song)} />
            )}

            {activeTab === 'playlists' && (
              <Playlists
                onSelectPlaylist={handleSelectPlaylist}
                onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
              />
            )}

            {activeTab === 'playlist-detail' && selectedPlaylist && (
              <PlaylistDetail
                playlist={selectedPlaylist}
                onBack={() => setActiveTab('playlists')}
                onOpenAddToPlaylist={(song) => setSongForPlaylist(song)}
              />
            )}

            {activeTab === 'liked' && (
              <Favourites
                onOpenAddToPlaylist={(song) => setSongForPlaylist(song)}
                onExplore={() => setActiveTab('discover')}
              />
            )}

            {activeTab === 'history' && (
              <History
                onOpenAddToPlaylist={(song) => setSongForPlaylist(song)}
                onExplore={() => setActiveTab('discover')}
              />
            )}

            {activeTab === 'search' && (
              <SearchResults
                query={searchQuery}
                onOpenAddToPlaylist={(song) => setSongForPlaylist(song)}
                onNavigateTab={setActiveTab}
              />
            )}
          </main>
        </div>
      </div>

      {/* 4. Floating Frosted Glass Bottom Player */}
      <Player onOpenAddToPlaylist={(song) => setSongForPlaylist(song)} />

      {/* 5. Unified YouTube Cinema Theater Player & Floating Mini Player */}
      <TheaterPlayer onOpenAddToPlaylist={(song) => setSongForPlaylist(song)} />

      {/* 6. Sliding Queue Drawer */}
      <QueueDrawer onOpenAddToPlaylist={(song) => setSongForPlaylist(song)} />

      {/* 7. Mobile Bottom Navigation Dock (Visible strictly on mobile screens < md) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab !== 'playlist-detail') setSelectedPlaylist(null);
          setActiveTab(tab);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
      />

      {/* 8. Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
      />

      <AddToPlaylistModal
        song={songForPlaylist}
        onClose={() => setSongForPlaylist(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <PlayerProvider>
          <MainApp />
        </PlayerProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
