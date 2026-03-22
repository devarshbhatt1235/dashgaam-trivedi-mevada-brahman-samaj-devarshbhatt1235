import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable, samajTable, leadersTable } from "@workspace/db";
import { logger } from "./logger.js";

export async function seedIfEmpty() {
  try {
    const existingUsers = await db.select().from(usersTable);
    if (existingUsers.length > 0) {
      logger.info("Users already exist, skipping seed");
      return;
    }

    logger.info("No users found, seeding default users...");

    const homeAdminPassword = await bcrypt.hash("home123", 10);
    const superAdminPassword = await bcrypt.hash("super123", 10);

    await db.insert(usersTable).values([
      { username: "homeadmin", password: homeAdminPassword, role: "home_admin" },
      { username: "superadmin", password: superAdminPassword, role: "super_admin" },
    ]);

    logger.info("Seeded users: homeadmin (home_admin), superadmin (super_admin)");

    const existingSamaj = await db.select().from(samajTable);
    if (existingSamaj.length === 0) {
      await db.insert(samajTable).values({ samaj_name: "શ્રી સમાજ પરિવાર ડિરેક્ટ્રી" });
      logger.info("Seeded default samaj name");
    }

    const existingLeaders = await db.select().from(leadersTable);
    if (existingLeaders.length === 0) {
      await db.insert(leadersTable).values([
        { name: "રામભાઈ પટેલ", role: "પ્રમુખ", mobile: "9898989898", address: "ગામ - અમદાવાદ", order: 1 },
        { name: "સુરેશભાઈ શાહ", role: "ઉપ-પ્રમુખ", mobile: "9797979797", address: "ગામ - સુરત", order: 2 },
        { name: "કિશોરભાઈ વ્યાસ", role: "સચિવ", mobile: "9696969696", address: "ગામ - વડોદરા", order: 3 },
      ]);
      logger.info("Seeded default leaders");
    }
  } catch (err) {
    logger.error({ err }, "Seed error");
  }
}
