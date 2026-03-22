import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const samajTable = pgTable("samaj", {
  id: serial("id").primaryKey(),
  samaj_name: text("samaj_name").notNull(),
});

export const leadersTable = pgTable("leaders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  mobile: text("mobile"),
  address: text("address"),
  order: integer("order").notNull().default(0),
});

export const insertSamajSchema = createInsertSchema(samajTable).omit({ id: true });
export const insertLeaderSchema = createInsertSchema(leadersTable).omit({ id: true });

export type InsertSamaj = z.infer<typeof insertSamajSchema>;
export type Samaj = typeof samajTable.$inferSelect;
export type InsertLeader = z.infer<typeof insertLeaderSchema>;
export type Leader = typeof leadersTable.$inferSelect;
