import mongoose, { Schema, type InferSchemaType } from "mongoose";

const samajSchema = new Schema({
  samaj_name: { type: String, required: true },
});

export type SamajDoc = InferSchemaType<typeof samajSchema> & { _id: mongoose.Types.ObjectId };
export type Samaj = { id: string; samaj_name: string };

export const SamajModel = (mongoose.models.Samaj as mongoose.Model<SamajDoc>) ||
  mongoose.model<SamajDoc>("Samaj", samajSchema);

const leaderSchema = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  mobile: { type: String, default: null },
  address: { type: String, default: null },
  order: { type: Number, required: true, default: 0 },
});

export type LeaderDoc = InferSchemaType<typeof leaderSchema> & { _id: mongoose.Types.ObjectId };
export type Leader = {
  id: string;
  name: string;
  role: string;
  mobile?: string | null;
  address?: string | null;
  order: number;
};

export const LeaderModel = (mongoose.models.Leader as mongoose.Model<LeaderDoc>) ||
  mongoose.model<LeaderDoc>("Leader", leaderSchema);
