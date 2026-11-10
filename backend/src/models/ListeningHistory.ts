import mongoose, { Schema, Document } from 'mongoose';

export interface IListeningHistory extends Document {
  userId: string;
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration?: string;
  playedAt: Date;
}

const ListeningHistorySchema = new Schema<IListeningHistory>(
  {
    userId: { type: String, required: true, default: 'guest', index: true },
    videoId: { type: String, required: true },
    title: { type: String, required: true },
    artist: { type: String, required: true },
    thumbnail: { type: String, required: true },
    duration: { type: String, default: '3:30' },
    playedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

ListeningHistorySchema.index({ userId: 1, playedAt: -1 });

export const ListeningHistory = mongoose.model<IListeningHistory>('ListeningHistory', ListeningHistorySchema);

