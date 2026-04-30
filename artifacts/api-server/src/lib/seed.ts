import bcrypt from "bcryptjs";
import { UserModel, SamajModel, LeaderModel } from "@workspace/db";
import { logger } from "./logger.js";

export async function seedIfEmpty() {
  try {
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      logger.info("No users found, seeding default users...");
      const homeAdminPassword = await bcrypt.hash("home123", 10);
      const superAdminPassword = await bcrypt.hash("super123", 10);
      await UserModel.insertMany([
        { username: "homeadmin", password: homeAdminPassword, role: "home_admin" },
        { username: "superadmin", password: superAdminPassword, role: "super_admin" },
      ]);
      logger.info("Seeded users: homeadmin (home_admin), superadmin (super_admin)");
    } else {
      logger.info("Users already exist, skipping user seed");
    }

    const samajCount = await SamajModel.countDocuments();
    if (samajCount === 0) {
      await SamajModel.create({ samaj_name: "શ્રી સમાજ પરિવાર ડિરેક્ટ્રી" });
      logger.info("Seeded default samaj name");
    }

    const leaderCount = await LeaderModel.countDocuments();
    if (leaderCount === 0) {
      await LeaderModel.insertMany([
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
