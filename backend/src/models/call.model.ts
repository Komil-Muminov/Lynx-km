import mongoose, { Schema, Document } from 'mongoose';

export enum ECallType {
  WAITER = 'waiter',
  HOOKAH = 'hookah',
  PAYMENT = 'payment'
}

export interface IStaffCall extends Document {
  restaurantId: mongoose.Types.ObjectId;
  tableId: string;
  type: ECallType;
  status: 'pending' | 'resolved';
  createdAt: Date;
}

const StaffCallSchema = new Schema<IStaffCall>({
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  tableId: { type: String, required: true },
  type: { type: String, enum: Object.values(ECallType), required: true },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export const StaffCall = mongoose.model<IStaffCall>('StaffCall', StaffCallSchema);
