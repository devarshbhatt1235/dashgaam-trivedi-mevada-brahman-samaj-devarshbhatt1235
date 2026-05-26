import mongoose, { Schema, type InferSchemaType } from "mongoose";

const memberSchema = new Schema({
  sr_no: { type: Number, required: true },
  name: { type: String, required: true },
  dob: { type: String, default: null },
  occupation: { type: String, default: null },
  relation: { type: String, required: true },
  marital_status: { type: String, required: true, default: "unmarried" },
  mobile: { type: String, default: null },
  // New fields:
  education: { type: String, default: null }, // અભ્યાસ
  qualification: { type: String, default: null }, // લાયકાત
});

export type EmbeddedMember = InferSchemaType<typeof memberSchema> & {
  _id: mongoose.Types.ObjectId;
};

const homeSchema = new Schema({
  kutumb_vada_name: { type: String, required: true },
  kutumb_vada_address: { type: String, required: true },
  kutumb_vada_mobile: { type: String, default: null },
  // Ghar nu sarnamu
  house_no: { type: String, required: true },
  faliya: { type: String, required: true },
  village: { type: String, required: true },
  // Hal nu sarnamu (current address)
  current_house_no: { type: String, default: null },
  current_area: { type: String, default: null },
  current_landmark: { type: String, default: null },
  current_city: { type: String, default: null },
  current_district: { type: String, default: null },
  current_pincode: { type: String, default: null },
  members: { type: [memberSchema], default: [] },
});

export type HomeDoc = InferSchemaType<typeof homeSchema> & { _id: mongoose.Types.ObjectId };

export const HomeModel = (mongoose.models.Home as mongoose.Model<HomeDoc>) ||
  mongoose.model<HomeDoc>("Home", homeSchema);

export type Member = {
  id: string;
  sr_no: number;
  name: string;
  dob?: string | null;
  occupation?: string | null;
  relation: string;
  marital_status: string;
  mobile?: string | null;
  education?: string | null;
  qualification?: string | null;
  home_id: string;
};

export type Home = {
  id: string;
  kutumb_vada_name: string;
  kutumb_vada_address: string;
  kutumb_vada_mobile?: string | null;
  house_no: string;
  faliya: string;
  village: string;
  current_house_no?: string | null;
  current_area?: string | null;
  current_landmark?: string | null;
  current_city?: string | null;
  current_district?: string | null;
  current_pincode?: string | null;
};
