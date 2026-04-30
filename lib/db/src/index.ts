import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error(
    "MONGODB_URI must be set. Did you forget to provide a MongoDB connection string?",
  );
}

let connectPromise: Promise<typeof mongoose> | null = null;

export function connectMongo(): Promise<typeof mongoose> {
  if (!connectPromise) {
    mongoose.set("strictQuery", true);
    connectPromise = mongoose.connect(process.env.MONGODB_URI as string, {
      serverSelectionTimeoutMS: 10000,
    });
  }
  return connectPromise;
}

export { mongoose };
export * from "./schema/index.js";
