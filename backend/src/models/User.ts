import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  preferences: {
    energyPreference?: string;
    autoPlay?: boolean;
    theme?: string;
  };
  favouriteGenres: string[];
  preferredLanguages: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, default: 'Guest Explorer' },
    email: { type: String, required: true, default: 'guest@aurapulse.ai' },
    preferences: {
      energyPreference: { type: String, default: 'balanced' },
      autoPlay: { type: Boolean, default: true },
      theme: { type: String, default: 'dark-violet' },
    },
    favouriteGenres: { type: [String], default: ['Lo-Fi', 'Pop', 'Indie', 'Bollywood'] },
    preferredLanguages: { type: [String], default: ['English', 'Hindi'] },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);

