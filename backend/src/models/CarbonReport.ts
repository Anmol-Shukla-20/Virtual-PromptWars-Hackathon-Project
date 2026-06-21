import mongoose, { Schema, Document } from 'mongoose';

export interface ICarbonReport extends Document {
  user: mongoose.Types.ObjectId;
  reportType: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  totalEmissions: number;
  transportationEmissions: number;
  electricityEmissions: number;
  lifestyleEmissions: number;
  shoppingEmissions: number;
}

const CarbonReportSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reportType: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  
  totalEmissions: { type: Number, default: 0 },
  transportationEmissions: { type: Number, default: 0 },
  electricityEmissions: { type: Number, default: 0 },
  lifestyleEmissions: { type: Number, default: 0 },
  shoppingEmissions: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<ICarbonReport>('CarbonReport', CarbonReportSchema);
