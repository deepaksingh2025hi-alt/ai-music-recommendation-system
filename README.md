# 🎵 AuraPulse AI — AI-Powered Music Recommendation & Streaming Platform

An intelligent, next-generation music streaming application inspired by modern glassmorphic dashboard design. Users can describe their mood, vibe, or listening purpose in natural language (e.g. *"I want peaceful Hindi songs for studying"*, *"Energetic gym motivational beats"*, *"Nostalgic 2000s acoustic pop"*) and receive deep sentiment-analyzed AI recommendations, auto-generated playlists, and complete full-song playback powered by the official **YouTube IFrame Player API**.

---

## 🌟 Key Highlights & Architecture

- **Dark Charcoal / Neon Violet UI**: Designed with glassmorphic cards, glowing radial accents, responsive sidebar, top search bar, and smooth Framer Motion transitions.
- **Natural Language AI Engine**: Analyzes user prompts with Google Gemini API to extract mood, genre, languages, energy level, tempo, listening intent, and multi-query search expansions.
- **YouTube Data API v3 Search**: Fetches real official YouTube songs, thumbnails, channel/artist metadata, and video durations. Includes a resilient scraper fallback for instant zero-config exploration.
- **Full Song Playback (YouTube IFrame API)**:
  - Persistent bottom music player with live progress bar, seek scrubbing, volume slider, mute toggle, shuffle, and repeat modes.
  - **Expandable Now Playing Theater Mode**: Expands the live YouTube video player into an immersive cinema display with track metadata, Up Next queue, and direct YouTube links.
  - Complies with official YouTube API requirements: never hidden, never zero-sized, maintains native branding and uninterrupted playback.
- **Smart Queue & Playlist Management**:
  - Play entire playlists or shuffle them into the active queue.
  - Add/remove songs to custom or AI-generated playlists.
  - Like/favourite songs and track listening history.
- **Database & Resilience**:
  - MongoDB with Mongoose collections for Users, Playlists, Favourites, and Listening History.
  - Seamless JSON fallback storage if local MongoDB is offline, guaranteeing 100% uptime with zero crashes.
- **In-App Settings & API Key Configurator**: Users can test status and configure Gemini or YouTube API keys directly inside the platform UI or via `.env`.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React |
| **Backend** | Node.js, Express.js, TypeScript, tsx, Axios |
| **AI Recommendation** | Google Gemini API (`@google/generative-ai`), Intelligent Heuristic NLP Engine |
| **Music Search** | YouTube Data API v3 (`search` & `videos.list`), Live Public Stream Fallback |
| **Playback** | Official YouTube IFrame Player API |
| **Database** | MongoDB 8.x with Mongoose ODM (with automatic resilient storage fallback) |

---

## 📁 Project Structure

```
msr/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts               # MongoDB connection with graceful fallback
│   │   │   └── env.ts              # Environment variables & runtime key updating
│   │   ├── controllers/
│   │   │   ├── aiController.ts     # POST /api/ai/analyze
│   │   │   ├── musicController.ts  # GET /api/music/search, POST /api/music/recommend, GET /trending
│   │   │   ├── playlistController.ts # CRUD for Playlists & track management
│   │   │   ├── userController.ts   # Favourites, History & User Profile
│   │   │   └── configController.ts # System status & runtime key updates
│   │   ├── models/
│   │   │   ├── User.ts             # User preferences, genres, languages
│   │   │   ├── Playlist.ts         # User & AI-generated playlists
│   │   │   ├── Favourite.ts        # Liked songs
│   │   │   └── ListeningHistory.ts  # Playback logs
│   │   ├── routes/                 # Express REST router declarations
│   │   ├── services/
│   │   │   ├── geminiService.ts    # Gemini 1.5 Flash prompt analysis & NLP heuristic
│   │   │   ├── youtubeService.ts   # YouTube Data API v3 & resilient scraper
│   │   │   ├── recommendationService.ts # Multi-query search, ranking & playlist synthesis
│   │   │   └── storageService.ts   # Unified Mongoose & Local DB manager
│   │   ├── utils/
│   │   │   ├── durationParser.ts   # ISO 8601 duration parser (PT3M45S -> 3:45)
│   │   │   └── htmlDecoder.ts      # YouTube title unescaper
│   │   └── index.ts                # Express server bootstrapping & route mounting
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx      # Top bar with logo, prominent AI search, and profile
│   │   │   │   ├── Sidebar.tsx     # Left nav: Home, Discover, Trending, Playlists, Liked, History
│   │   │   │   ├── Player.tsx      # Persistent bottom player with scrubbing and volume
│   │   │   │   ├── YouTubeHost.tsx # Permanent visible YouTube IFrame viewport container
│   │   │   │   └── ExpandedPlayer.tsx # Full Now Playing Theater overlay & Up Next
│   │   │   ├── music/
│   │   │   │   ├── SongCard.tsx    # Glassmorphic card with play overlay, like & queue buttons
│   │   │   │   ├── SongRow.tsx     # List row item for queues and playlists
│   │   │   │   ├── PlaylistCard.tsx # Playlist card with artwork & mood badges
│   │   │   │   ├── SectionHeader.tsx # Clean section typography
│   │   │   │   ├── QueueDrawer.tsx # Sliding Up Next queue manager
│   │   │   │   └── AddToPlaylistModal.tsx # Add to playlist or create new on-the-fly
│   │   │   ├── hero/
│   │   │   │   └── HeroFeatured.tsx # Dynamic hero section with featured AI playlist
│   │   │   ├── modals/
│   │   │   │   ├── SettingsModal.tsx # In-app API key editor & user taste preferences
│   │   │   │   └── CreatePlaylistModal.tsx # New custom playlist creation
│   │   │   └── common/
│   │   │       ├── SkeletonCard.tsx # Shimmering loading placeholders
│   │   │       └── EmptyState.tsx   # Glassmorphic zero-state visual
│   │   ├── context/
│   │   │   ├── PlayerContext.tsx   # YouTube IFrame API synchronizer & queue orchestrator
│   │   │   ├── AuthContext.tsx     # User preferences, playlists, and favourites state
│   │   │   └── ToastContext.tsx    # Glowing animated toast alerts
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx       # Main dashboard: Hero, Made For Your Mood, Trending, Playlists
│   │   │   ├── Discover.tsx        # Natural language prompt studio with Gemini AI Breakdown
│   │   │   ├── Trending.tsx        # Top 50 trending chart with region selector
│   │   │   ├── Playlists.tsx       # User & AI playlist collections
│   │   │   ├── PlaylistDetail.tsx  # Tracklist, play all, shuffle, rename, delete
│   │   │   ├── Favourites.tsx      # Liked songs library
│   │   │   ├── History.tsx         # Session listening history
│   │   │   └── SearchResults.tsx   # Instant search & AI recommendation results
│   │   ├── services/
│   │   │   └── api.ts              # Axios client with proxy routing
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript interfaces
│   │   ├── styles/
│   │   │   └── index.css           # Glassmorphism utilities & scrollbars
│   │   ├── App.tsx                 # Root application
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24.20.0)
- **npm** or **pnpm**
- *(Optional)* **MongoDB** installed locally (or a free MongoDB Atlas connection string). If MongoDB is not running, the application will automatically fall back to its internal resilient JSON store.

---

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory (or use the one in root):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ai_music

# YouTube Data API v3 Key (from Google Cloud Console)
# If empty, the app uses its resilient live YouTube scraper fallback
YOUTUBE_API_KEY=YOUR_YOUTUBE_API_KEY

# Google Gemini API Key (from Google AI Studio)
# If empty, the app uses its built-in NLP mood & genre heuristic extractor
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

> **Tip**: You can also enter and update your API keys anytime at runtime via the **Settings Modal** (gear icon in the app navigation bar) without restarting the server!

---

### 3. Startup Commands

#### Option A: Run Both Backend & Frontend Simultaneously (Recommended)
From the root folder, run:
```bash
npm run dev
```
This concurrently launches:
- **Backend API Server** at: `http://localhost:5000`
- **Frontend Vite Dev Server** at: `http://localhost:5173`

#### Option B: Run in Separate Terminals

**Terminal 1 — Backend:**
```bash
npm run dev:backend
# or: cd backend && npm run dev
```

**Terminal 2 — Frontend:**
```bash
npm run dev:frontend
# or: cd frontend && npm run dev
```

#### Option C: Start Local MongoDB (Optional)
If you have MongoDB installed locally at `C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe`, you can start it with:
```bash
npm run start:db
```

---

## 🧪 Acceptance Testing Workflow

Follow this step-by-step test to verify all 14 points of the project specification:

1. **Open the Application**:
   Navigate to `http://localhost:5173` in your browser.
2. **Natural Language Search**:
   Type `"I want peaceful Hindi songs"` in the top navigation search bar and hit Enter.
3. **AI Interpretation**:
   - The platform sends the request to `/api/music/recommend`.
   - The AI analyzer extracts: `mood: "Peaceful"`, `language: ["Hindi"]`, `energy: "low"`, `tempo: "slow"`, `playlistTitle: "Peaceful Bollywood Sessions"`.
4. **Real YouTube Song Retrieval**:
   Real YouTube songs (e.g. *Kesariya*, *Apna Bana Le*, *Raataan Lambiyan*) are retrieved with authentic video IDs, channel names, high-resolution thumbnails, and durations.
5. **Playback**:
   Click on any song card or click **Play Entire Playlist**.
6. **YouTube IFrame Synchronization**:
   - The official YouTube player starts playing the real video.
   - The persistent bottom player synchronizes current playback time and total duration.
   - Seek forward or backward using the scrubbing bar.
   - Adjust the volume or mute/unmute.
7. **Now Playing Theater Mode**:
   Click the **"Video"** or **"Theater"** button on the player to expand into full cinema view. The video continues playing without interruption!
8. **Playlist & Library Operations**:
   - Click the heart icon to save to **Liked Songs**.
   - Click the `+` icon on any card to add the song to a playlist or create a new playlist.
   - Go to **My Playlists** or **Recently Played** in the sidebar to view your activity.
9. **Queue & Auto-advance**:
   When a song finishes, the player automatically plays the next track in the queue according to your repeat settings.

---

## 📡 API Reference Summary

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/analyze` | AI prompt extraction (mood, genre, language, tempo, queries) |
| `GET` | `/api/music/search?q=...` | YouTube music search with deduplication & durations |
| `POST` | `/api/music/recommend` | Complete pipeline: Gemini AI analysis + multi-query YouTube search + ranked playlist |
| `GET` | `/api/music/trending?regionCode=IN` | Trending music chart from YouTube |
| `GET` | `/api/playlists` | Retrieve all user and AI playlists |
| `POST` | `/api/playlists` | Create a new custom or AI playlist |
| `GET` | `/api/playlists/:id` | Get specific playlist and songs |
| `PUT` | `/api/playlists/:id` | Rename or update playlist details |
| `DELETE` | `/api/playlists/:id` | Delete a playlist |
| `POST` | `/api/playlists/:id/songs` | Add a track to playlist |
| `DELETE` | `/api/playlists/:id/songs/:videoId` | Remove a track from playlist |
| `GET` | `/api/favourites` | Get bookmarked songs |
| `POST` | `/api/favourites` | Add song to favourites |
| `DELETE` | `/api/favourites/:videoId` | Remove song from favourites |
| `GET` | `/api/history` | Get recently played history |
| `POST` | `/api/history` | Log track playback |
| `GET` | `/api/config/status` | Check Gemini, YouTube API, and MongoDB connection status |
| `POST` | `/api/config/keys` | Update API keys dynamically from the UI |

---

## 🛡️ License

MIT License — Built with ❤️ for modern music streaming and AI recommendation workflows.

