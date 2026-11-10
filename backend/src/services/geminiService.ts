import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';

export interface AIAnalysisResult {
  mood: string;
  genre: string;
  language: string[];
  energy: 'low' | 'medium' | 'high';
  purpose: string;
  tempo: 'slow' | 'medium' | 'fast';
  searchQueries: string[];
  playlistTitle: string;
  playlistDescription: string;
  provider: 'gemini' | 'heuristic';
}

export interface AIChatResult {
  reply: string;
  musicQueries: string[];
  suggestedPrompts: string[];
  detectedMood?: string;
  isMusicRelated: boolean;
  provider: 'gemini' | 'heuristic';
}

export class GeminiService {
  /**
   * Helper to execute Gemini generation trying multiple candidate models
   */
  private async generateWithFallbackModels(
    promptContents: any[],
    apiKey: string
  ): Promise<string> {
    const candidateModels = [
      'gemini-2.0-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
    ];

    const genAI = new GoogleGenerativeAI(apiKey);
    let lastError: any = null;

    const timeoutPromise = (ms: number) =>
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
      );

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result: any = await Promise.race([
          model.generateContent(promptContents),
          timeoutPromise(4500),
        ]);
        const text = result?.response?.text ? result.response.text() : '';
        if (text) {
          return text;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[GeminiService] Model ${modelName} returned error: ${err?.message}. Trying next candidate.`);
      }
    }

    throw lastError || new Error('All Gemini model candidates failed');
  }

  /**
   * Analyze user music prompt using Gemini or intelligent heuristic fallback
   */
  async analyzeMusicPrompt(
    prompt: string,
    userPreferences?: { favouriteGenres?: string[]; preferredLanguages?: string[] }
  ): Promise<AIAnalysisResult> {
    const trimmed = prompt.trim();
    if (!trimmed) {
      return this.heuristicFallback('chill relaxing music', userPreferences);
    }

    if (config.geminiApiKey) {
      try {
        const systemInstruction = `
You are an expert music curator and recommendation intelligence engine for a music streaming platform.
Analyze the user's natural language music request and user preferences.

CRITICAL INSTRUCTION - STRICTLY MUSIC ONLY & STANDALONE TRACKS:
This application is strictly for MUSIC, SONGS, AUDIO TRACKS, and ALBUMS.
You must NEVER return or search for workout tutorials, gym exercise instructions, fitness routines, speech motivation, vlogs, podcasts, interviews, or non-musical video content.
If the user mentions "gym", "workout", "fitness", or similar, they want high-energy GYM WORKOUT MUSIC TRACKS, songs, beats, or EDM/hip-hop motivational tracks (e.g. "high energy gym workout music songs", "beast mode gym motivation audio tracks", "gym workout phonk remix").
Every search query in "searchQueries" MUST explicitly target individual, standalone hit song titles (e.g. "Tum Hi Ho Aashiqui 2 official song", "Sunn Raha Hai Na Tu Arijit Singh").
NEVER generate queries for full album jukeboxes, 1-hour compilations, or non-stop mixes. Every query must find a single playable song.

User Preferences (if provided):
- Preferred Genres: ${userPreferences?.favouriteGenres?.join(', ') || 'Any'}
- Preferred Languages: ${userPreferences?.preferredLanguages?.join(', ') || 'Any'}

JSON format:
{
  "mood": "string (e.g. peaceful, energetic, melancholic, romantic, euphoric, focused, nostalgic)",
  "genre": "string (e.g. Lo-Fi, Pop, Bollywood, Acoustic, Rock, Ambient, EDM, Hip-Hop, Classical, R&B)",
  "language": ["Array of languages, e.g. 'Hindi', 'English', 'Punjabi', 'Instrumental'"],
  "energy": "low" | "medium" | "high",
  "purpose": "string (e.g. studying, gym workout, late-night driving, heartbreak, meditation, party)",
  "tempo": "slow" | "medium" | "fast",
  "searchQueries": [
    "Array of 3 to 4 distinct, precise search queries optimized for YouTube Data API v3 category 10 (Music) to find real songs/audio tracks, e.g. 'peaceful acoustic Hindi songs official audio', 'calm relaxing lofi chill beats study'"
  ],
  "playlistTitle": "Catchy, evocative 3-5 word playlist title",
  "playlistDescription": "Rich, poetic 1-2 sentence description explaining the vibe"
}
`;

        const rawText = await this.generateWithFallbackModels(
          [
            { text: systemInstruction },
            { text: `User request: "${trimmed}"` },
          ],
          config.geminiApiKey
        );

        const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleaned);

        return {
          mood: parsed.mood || 'Vibrant',
          genre: parsed.genre || 'Various',
          language: Array.isArray(parsed.language) ? parsed.language : ['English'],
          energy: parsed.energy || 'medium',
          purpose: parsed.purpose || 'Listening',
          tempo: parsed.tempo || 'medium',
          searchQueries: Array.isArray(parsed.searchQueries) && parsed.searchQueries.length > 0
            ? parsed.searchQueries
            : [trimmed + ' full song audio'],
          playlistTitle: parsed.playlistTitle || `${trimmed} Mix`,
          playlistDescription: parsed.playlistDescription || `A curated collection inspired by "${trimmed}".`,
          provider: 'gemini',
        };
      } catch (err: any) {
        console.warn(`[GeminiService] Gemini analyze API call failed (${err?.message}). Engaging intelligent heuristic parser.`);
      }
    }

    return this.heuristicFallback(trimmed, userPreferences);
  }

  /**
   * Interactive Music Chatbot powered by Gemini with STRICT MUSIC-ONLY GUARDRAILS
   */
  async chatMusic(
    message: string,
    history: Array<{ role: 'user' | 'model'; content: string }>,
    userPreferences?: { favouriteGenres?: string[]; preferredLanguages?: string[] }
  ): Promise<AIChatResult> {
    const trimmed = message.trim();
    if (!trimmed) {
      return {
        reply: "Hey there! I am AuraBot, your personal music concierge. Tell me what mood, genre, or artist you want to hear today! 🎵",
        musicQueries: [],
        suggestedPrompts: [
          'High energy gym workout beats',
          'Peaceful lo-fi beats for studying',
          'Romantic Bollywood songs',
        ],
        isMusicRelated: true,
        provider: 'heuristic',
      };
    }

    if (config.geminiApiKey) {
      try {
        const systemInstruction = `
You are AuraBot, the passionate, knowledgeable personal AI Music Concierge and Streaming Guide for AuraPulse.
You possess world-class expertise in music history, songs, artists, bands, albums, instruments, genres (Bollywood, Pop, EDM, Lo-Fi, Hip-Hop, Rock, Jazz, Classical, Phonk, Acoustic, Indie), audio production, and sonic moods.

CRITICAL POLICY - STRICTLY MUSIC ONLY:
You are an AI ONLY FOR MUSIC, SONGS, ALBUMS, ARTISTS, AND MUSICAL VIBES.
- If the user asks about ANYTHING outside music (e.g. coding, math, general science, politics, food recipes, sports fixtures, fitness training instructions, personal life advice, homework, etc.):
  1. Set "isMusicRelated": false
  2. In "reply": Politely decline and warmly pivot back to music.
     Example: "I am AuraPulse's dedicated music concierge! 🎵 While I specialize strictly in music and can't help with that, I can definitely find the perfect soundtrack for your day! What kind of sound or mood are you looking for?"
  3. Set "musicQueries": []
  4. Provide 3 music suggestions in "suggestedPrompts" (e.g. ["Upbeat motivation beats", "Peaceful chill study lo-fi", "Bollywood romantic love songs"]).

- If the user's message IS music-related (e.g. asking for song recommendations, musical vibes, artists, workout songs, study beats, party tracks, melancholic ballads, etc.):
  1. Set "isMusicRelated": true
  2. In "reply": Give a warm, conversational, 2-3 sentence answer explaining why these song picks match their vibe.
  3. In "musicQueries": Provide 3 to 5 distinct, high-precision search queries targeting exact tracks (e.g. ["The Weeknd - Blinding Lights official music", "Dua Lipa - Physical official audio", "Travis Scott - Goosebumps track"]). Every query MUST have keywords like 'song', 'music', 'audio', or 'official track'.
  4. In "suggestedPrompts": Provide 3 concise follow-up prompt chips for the user to click next.
  5. In "detectedMood": A 1-2 word mood descriptor (e.g. "Energetic", "Melancholic", "Focused", "Euphoric", "Chill", "Romantic").

OUTPUT FORMAT:
Return pure JSON only (no markdown formatting, no code fences):
{
  "isMusicRelated": boolean,
  "reply": "string",
  "musicQueries": ["query 1", "query 2", "query 3"],
  "suggestedPrompts": ["prompt 1", "prompt 2", "prompt 3"],
  "detectedMood": "string"
}
`;

        // Format recent history (last 6 exchanges)
        const recentHistory = history.slice(-6).map((h) => ({
          text: `${h.role === 'user' ? 'User' : 'AuraBot'}: ${h.content}`,
        }));

        const promptContents = [
          { text: systemInstruction },
          ...recentHistory,
          { text: `User request: "${trimmed}"` },
        ];

        const rawText = await this.generateWithFallbackModels(promptContents, config.geminiApiKey);
        const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleaned);

        return {
          reply: parsed.reply || "Here are some hand-picked music recommendations for you!",
          musicQueries: Array.isArray(parsed.musicQueries) ? parsed.musicQueries : [],
          suggestedPrompts: Array.isArray(parsed.suggestedPrompts) ? parsed.suggestedPrompts : [
            'More upbeat songs',
            'Slower acoustic tracks',
            'Something 90s classic',
          ],
          detectedMood: parsed.detectedMood || 'Vibrant',
          isMusicRelated: parsed.isMusicRelated !== false,
          provider: 'gemini',
        };
      } catch (err: any) {
        console.warn(`[GeminiService] Gemini chatMusic failed (${err?.message}). Engaging intelligent heuristic chat.`);
      }
    }

    return this.heuristicChatFallback(trimmed, userPreferences);
  }

  /**
   * Intelligent heuristic chat fallback
   */
  private heuristicChatFallback(
    prompt: string,
    userPreferences?: { favouriteGenres?: string[]; preferredLanguages?: string[] }
  ): AIChatResult {
    const text = prompt.toLowerCase();

    // 1. Guardrail against off-topic queries
    const nonMusicPatterns = /\b(code|python|javascript|java|c\+\+|html|css|debug|compile|fix error|solve math|calculate|equation|integral|derivative|recipe|how to cook|ingredients|president|prime minister|capital of|election|stock market|crypto price|workout tutorial|how to do bench press|exercises form)\b/i;

    if (nonMusicPatterns.test(text) && !/music|song|track|beats|sound|playlist|audio|sing|album/i.test(text)) {
      return {
        reply: "I am AuraPulse's dedicated AI Music Concierge! 🎵 I specialize strictly in songs, artists, playlists, and sonic moods. While I cannot answer questions outside music, I would love to recommend some great tracks for you! What kind of vibe are you feeling right now?",
        musicQueries: [],
        suggestedPrompts: [
          'High energy gym workout beats',
          'Peaceful lo-fi beats for studying',
          'Top trending Bollywood songs',
        ],
        detectedMood: 'Neutral',
        isMusicRelated: false,
        provider: 'heuristic',
      };
    }

    // 2. Music-related query: detect vibe and curate songs
    const analysis = this.heuristicFallback(prompt, userPreferences);

    let reply = `Here are some ${analysis.mood.toLowerCase()} ${analysis.genre} tracks curated specially for your ${analysis.purpose.toLowerCase()}! Let me know if you want to dial up the energy or switch to a different language. 🎶`;
    if (analysis.mood === 'Energetic') {
      reply = `Let's pump it up! ⚡ Here are high-octane ${analysis.genre} anthems engineered with driving bass and fast tempos to power your session.`;
    } else if (analysis.mood === 'Peaceful' || analysis.mood === 'Chill') {
      reply = `Unwind and relax. 🍃 I've selected smooth, atmospheric ${analysis.genre} sounds designed to calm your mind and help you find your groove.`;
    } else if (analysis.mood === 'Romantic') {
      reply = `In the mood for romance? ❤️ Here are soulful ${analysis.genre} love songs filled with heartwarming melodies and gentle rhythms.`;
    }

    const followUps = [
      `More high energy ${analysis.genre}`,
      `Acoustic version of ${analysis.genre}`,
      `Trending 2026 ${analysis.genre} hits`,
    ];

    return {
      reply,
      musicQueries: analysis.searchQueries,
      suggestedPrompts: followUps,
      detectedMood: analysis.mood,
      isMusicRelated: true,
      provider: 'heuristic',
    };
  }

  /**
   * High quality NLP heuristic fallback when Gemini API key is not configured or rate-limited
   */
  private heuristicFallback(
    prompt: string,
    userPreferences?: { favouriteGenres?: string[]; preferredLanguages?: string[] }
  ): AIAnalysisResult {
    const text = prompt.toLowerCase();

    // Detect language
    const languages: string[] = [];
    if (/hindi|bollywood|desi|punjabi|urdu|arijit|shreya|kishore|kumar sanu|aashiqui|sonu|alka|udit|lata|rafi|armaan|jubin|atif|mohit|badshah|pritam|mithoon|sachin|jigar|darshan|neha/i.test(text)) {
      languages.push('Hindi');
    }
    if (/punjabi|diljit|ap dhillon|sidhu|karan aujla/i.test(text)) {
      languages.push('Punjabi');
    }
    if (/english|pop|rock|hollywood|ed sheeran|taylor/i.test(text) || languages.length === 0) {
      languages.push('English');
    }
    if (userPreferences?.preferredLanguages && languages.length === 0) {
      languages.push(...userPreferences.preferredLanguages);
    }

    // Detect Mood & Energy
    let mood = 'Vibrant';
    let energy: 'low' | 'medium' | 'high' = 'medium';
    let tempo: 'slow' | 'medium' | 'fast' = 'medium';
    let purpose = 'General Listening';

    if (/peace|relax|calm|sooth|quiet|serene|unwind/i.test(text)) {
      mood = 'Peaceful';
      energy = 'low';
      tempo = 'slow';
      purpose = 'Relaxation & Calm';
    } else if (/gym|workout|energy|energetic|motivation|hype|power|fitness/i.test(text)) {
      mood = 'Energetic';
      energy = 'high';
      tempo = 'fast';
      purpose = 'Workout & Motivation';
    } else if (/study|focus|work|read|deep work|code|coding/i.test(text)) {
      mood = 'Focused';
      energy = 'low';
      tempo = 'slow';
      purpose = 'Studying & Deep Focus';
    } else if (/sad|heartbreak|cry|pain|lonely|melancholy/i.test(text)) {
      mood = 'Melancholic';
      energy = 'low';
      tempo = 'slow';
      purpose = 'Emotional Comfort';
    } else if (/romantic|love|crush|date|valentine|soulmate|aashiqui|pyaar|dil|ishq|mohabbat/i.test(text)) {
      mood = 'Romantic';
      energy = 'medium';
      tempo = 'slow';
      purpose = 'Romance & Heartfelt Melodies';
    } else if (/night|midnight|sleep|late night|chill/i.test(text)) {
      mood = 'Chill';
      energy = 'low';
      tempo = 'slow';
      purpose = 'Late-Night Wind Down';
    } else if (/party|dance|club|festival|celebrat/i.test(text)) {
      mood = 'Euphoric';
      energy = 'high';
      tempo = 'fast';
      purpose = 'Party & Celebration';
    } else if (/nostalgi|2000s|90s|retro|old is gold|classic|vintage/i.test(text)) {
      mood = 'Nostalgic';
      energy = 'medium';
      tempo = 'medium';
      purpose = 'Throwback Reminiscing';
    }

    // Detect Genre & Purpose
    let genre = 'Ambient & Pop';
    let isGym = false;

    if (/gym|workout|fitness|pump|training|beast/i.test(text)) {
      mood = 'Energetic';
      energy = 'high';
      tempo = 'fast';
      purpose = 'Gym Workout & Training';
      genre = 'EDM & Motivational Hip-Hop';
      isGym = true;
    } else if (/aashiqui|bollywood|hindi|filmi|desi/i.test(text)) {
      genre = 'Bollywood Romantic';
    } else if (/lofi|lo-fi|beats/i.test(text)) {
      genre = 'Lo-Fi';
    } else if (/rock|metal/i.test(text)) {
      genre = 'Rock';
    } else if (/pop/i.test(text)) {
      genre = 'Pop';
    } else if (/acoustic|unplugged/i.test(text)) {
      genre = 'Acoustic';
    } else if (/edm|electronic|house|techno/i.test(text)) {
      genre = 'EDM';
    } else if (/hip hop|rap|trap/i.test(text)) {
      genre = 'Hip-Hop';
    } else if (/classical|instrumental/i.test(text)) {
      genre = 'Instrumental Classical';
    }

    // Build intelligent queries - ALWAYS PRIORITIZE USER SEARCH TERM
    const primaryLang = languages[0] || 'English';
    const cleanPrompt = prompt.replace(/i want|suggest|play|give me|songs?|music/gi, '').trim();

    let searchQueries: string[] = [];
    let playlistTitle = `${cleanPrompt ? cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1) : mood} ${genre.split(' ')[0]} Sessions`;
    let playlistDescription = `Handcrafted ${mood.toLowerCase()} tracklist designed for ${purpose.toLowerCase()}, featuring rich ${primaryLang} melodies.`;

    if (isGym) {
      searchQueries = [
        'best gym workout motivation songs official audio',
        'high energy gym workout music tracks EDM hip hop',
        'gym beast mode workout songs bass boosted',
        'intense fitness workout music playlist',
      ];
      playlistTitle = 'Beast Mode: Gym Workout Mix';
      playlistDescription = 'Pumping, adrenaline-fueled energetic tracks engineered for maximum workout performance and heavy lifting.';
    } else if (/aashiqui/i.test(text)) {
      searchQueries = [
        'Tum Hi Ho Aashiqui 2 Arijit Singh official audio',
        'Sunn Raha Hai Na Tu Aashiqui 2 official song',
        'Meri Aashiqui Song Aashiqui 2 Palak Muchhal Arijit Singh',
        'Chahun Main Ya Naa Aashiqui 2 official song',
        'Dheere Dheere Se Meri Zindagi Aashiqui Kumar Sanu',
        'Nazar Ke Saamne Jigar Ke Paas Aashiqui Kumar Sanu',
      ];
      playlistTitle = 'Aashiqui All-Time Hits';
      playlistDescription = 'Iconic soulful romantic ballads and timeless melodies from the legendary Aashiqui franchise.';
    } else if (/kabir\s*singh/i.test(text)) {
      searchQueries = [
        'Bekhayali Kabir Singh Sachet Tandon official',
        'Tujhe Kitna Chahne Lage Kabir Singh Arijit Singh',
        'Mere Sohneya Kabir Singh Sachet Parampara',
        'Kaise Hua Kabir Singh Vishal Mishra',
      ];
      playlistTitle = 'Kabir Singh Soundtrack';
      playlistDescription = 'Heart-wrenching romantic tracks and intense emotional melodies from Kabir Singh.';
    } else if (/animal/i.test(text)) {
      searchQueries = [
        'Arjan Vailly Animal official audio',
        'Satranga Animal Arijit Singh official song',
        'Pehle Bhi Main Animal Vishal Mishra',
        'Hua Main Animal Raghav Chaitanya',
      ];
      playlistTitle = 'Animal Movie Soundtrack';
      playlistDescription = 'Powerhouse, adrenaline-filled tracks and romantic ballads from the movie Animal.';
    } else if (/rockstar/i.test(text)) {
      searchQueries = [
        'Kun Faya Kun Rockstar AR Rahman',
        'Nadaan Parinde Rockstar Mohit Chauhan',
        'Tum Ho Rockstar Mohit Chauhan Suzanne D Mello',
        'Sadda Haq Rockstar AR Rahman Mohit Chauhan',
      ];
      playlistTitle = 'Rockstar AR Rahman Classics';
      playlistDescription = 'Sufi soul, electric rock, and legendary melodies by AR Rahman and Mohit Chauhan.';
    } else if (/arijit/i.test(text)) {
      searchQueries = [
        'Tum Hi Ho Arijit Singh official song',
        'Kesariya Brahmastra Arijit Singh',
        'Apna Bana Le Bhediya Arijit Singh',
        'Channa Mereya Ae Dil Hai Mushkil Arijit Singh',
      ];
      playlistTitle = 'Best of Arijit Singh';
      playlistDescription = 'The most beloved romantic and emotional chartbusters by Arijit Singh.';
    } else {
      searchQueries = [
        cleanPrompt ? `${cleanPrompt} songs official audio` : `${primaryLang} ${mood} songs official audio`,
        cleanPrompt ? `top hit songs ${cleanPrompt}` : `${cleanPrompt || mood} ${genre} songs music`,
        `${primaryLang} ${genre} ${mood} songs`,
      ];
    }

    return {
      mood,
      genre,
      language: languages,
      energy,
      purpose,
      tempo,
      searchQueries,
      playlistTitle,
      playlistDescription,
      provider: 'heuristic',
    };
  }
}

export const geminiService = new GeminiService();
