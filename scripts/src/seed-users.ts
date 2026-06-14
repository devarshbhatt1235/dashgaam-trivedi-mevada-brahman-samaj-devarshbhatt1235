import bcrypt from "bcryptjs";
import { connectMongo, UserModel } from "@workspace/db";

async function seedUsers() {
  await connectMongo();

  const existing = await UserModel.countDocuments();
  if (existing > 0) {
    const users = await UserModel.find({}, "username role").lean();
    console.log(
      "Users already seeded:",
      users.map((u) => `${u.username} (${u.role})`).join(", "),
    );
    process.exit(0);
  }

  const homeAdminPassword = await bcrypt.hash("home123", 10);
  const superAdminPassword = await bcrypt.hash("super123", 10);

  const users = await UserModel.insertMany([
    { username: "homeadmin", password: homeAdminPassword, role: "home_admin" },
    { username: "superadmin", password: superAdminPassword, role: "super_admin" },
  ]);

  console.log("Seeded users:");
  users.forEach((u) => console.log(`  - ${u.username} (${u.role})`));
  process.exit(0);
}

seedUsers().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
