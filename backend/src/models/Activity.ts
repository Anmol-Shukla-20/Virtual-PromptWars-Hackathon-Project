import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  user: mongoose.Types.ObjectId;
  activityType: 'transportation' | 'electricity' | 'lifestyle' | 'shopping';
  
  // For transportation
  mode?: string;
  distance?: number; // in km
  
  // For electricity
  unitsConsumed?: number; // in kWh
  billAmount?: number;
  
  // For lifestyle
  dietPreference?: 'Vegetarian' | 'Eggetarian' | 'Non-Vegetarian';
  
  // For shopping
  shoppingFrequency?: 'low' | 'medium' | 'high';
  
  carbonEmission: number; // calculated in kg CO2
  date: Date;
}

const ActivitySchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  activityType: { type: String, enum: ['transportation', 'electricity', 'lifestyle', 'shopping'], required: true },
  
  mode: { type: String },
  distance: { type: Number },
  
  unitsConsumed: { type: Number },
  billAmount: { type: Number },
  
  dietPreference: { type: String, enum: ['Vegetarian', 'Eggetarian', 'Non-Vegetarian'] },
  
  shoppingFrequency: { type: String, enum: ['low', 'medium', 'high'] },
  
  carbonEmission: { type: Number, required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<IActivity>('Activity', ActivitySchema);
