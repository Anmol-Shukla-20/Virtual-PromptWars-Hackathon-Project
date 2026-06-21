import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  fullName: string;
  email: string;
  password?: string;
  city?: string;
  occupation?: string;
  isDummy?: boolean;
  sustainabilityScore: number;
  totalCo2Saved: number;
  ecoPoints: number;
  currentLevel: string;
  streak: number;
  badges: string[];
}

const UserSchema: Schema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for Google OAuth or dummy
  city: { type: String },
  occupation: { type: String },
  isDummy: { type: Boolean, default: false },
  
  // Profile / Gamification stats
  sustainabilityScore: { type: Number, default: 0 },
  totalCo2Saved: { type: Number, default: 0 },
  ecoPoints: { type: Number, default: 0 },
  currentLevel: { type: String, default: '🌱 Green Beginner' },
  streak: { type: Number, default: 0 },
  badges: [{ type: String }]
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
