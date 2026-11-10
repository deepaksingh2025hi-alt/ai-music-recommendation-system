import mongoose, { Schema, Document } from 'mongoose';

export interface IFavourite extends Document {
  userId: string;
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration?: string;
  createdAt: Date;
}

const FavouriteSchema = new Schema<IFavourite>(
  {
    userId: { type: String, required: true, default: 'guest', index: true },
    videoId: { type: String, required: true },
    title: { type: String, required: true },
    artist: { type: String, required: true },
    thumbnail: { type: String, required: true },
    duration: { type: String, default: '3:30' },
  },
  { timestamps: true }
);

FavouriteSchema.index({ userId: 1, videoId: 1 }, { unique: true });

export const Favourite = mongoose.model<IFavourite>('Favourite', FavouriteSchema);

