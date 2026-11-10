import mongoose, { Schema, Document } from 'mongoose';

export interface ISong {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration?: string;
  channelTitle?: string;
  addedAt?: Date;
}

export interface IPlaylist extends Document {
  userId: string;
  title: string;
  description: string;
  mood?: string;
  songs: ISong[];
  coverImage?: string;
  isAiGenerated?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SongSubSchema = new Schema<ISong>(
  {
    videoId: { type: String, required: true },
    title: { type: String, required: true },
    artist: { type: String, required: true },
    thumbnail: { type: String, required: true },
    duration: { type: String, default: '3:30' },
    channelTitle: { type: String, default: '' },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const PlaylistSchema = new Schema<IPlaylist>(
  {
    userId: { type: String, required: true, default: 'guest' },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    mood: { type: String, default: 'General' },
    songs: { type: [SongSubSchema], default: [] },
    coverImage: { type: String, default: '' },
    isAiGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Playlist = mongoose.model<IPlaylist>('Playlist', PlaylistSchema);

