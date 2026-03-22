import { pgTable, serial, text, integer, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const homesTable = pgTable("homes", {
  id: serial("id").primaryKey(),
  kutumb_vada_name: text("kutumb_vada_name").notNull(),
  kutumb_vada_address: text("kutumb_vada_address").notNull(),
  house_no: varchar("house_no", { length: 50 }).notNull(),
  faliya: varchar("faliya", { length: 100 }).notNull(),
  village: varchar("village", { length: 100 }).notNull(),
});

export const membersTable = pgTable("members", {
  id: serial("id").primaryKey(),
  home_id: integer("home_id").notNull().references(() => homesTable.id, { onDelete: "cascade" }),
  sr_no: integer("sr_no").notNull(),
  name: text("name").notNull(),
  dob: varchar("dob", { length: 20 }),
  occupation: text("occupation"),
  relation: text("relation").notNull(),
  marital_status: varchar("marital_status", { length: 20 }).notNull().default("unmarried"),
  mobile: varchar("mobile", { length: 20 }),
});

export const insertHomeSchema = createInsertSchema(homesTable).omit({ id: true });
export const insertMemberSchema = createInsertSchema(membersTable).omit({ id: true });

export type InsertHome = z.infer<typeof insertHomeSchema>;
export type Home = typeof homesTable.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof membersTable.$inferSelect;
