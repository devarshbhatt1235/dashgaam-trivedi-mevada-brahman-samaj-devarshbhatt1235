import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function seedUsers() {
  const homeAdminPassword = await bcrypt.hash("home123", 10);
  const superAdminPassword = await bcrypt.hash("Bhatt@1235", 10);

  const existing = await db.select().from(usersTable);
  if (existing.length > 0) {
    console.log(
      "Users already seeded:",
      existing.map((u) => u.username).join(", "),
    );
    process.exit(0);
  }

  const users = await db
    .insert(usersTable)
    .values([
      {
        username: "homeadmin",
        password: homeAdminPassword,
        role: "home_admin",
      },
      {
        username: "superadmin",
        password: superAdminPassword,
        role: "super_admin",
      },
    ])
    .returning();

  console.log("Seeded users:");
  users.forEach((u) => console.log(`  - ${u.username} (${u.role})`));
  process.exit(0);
}

seedUsers().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
