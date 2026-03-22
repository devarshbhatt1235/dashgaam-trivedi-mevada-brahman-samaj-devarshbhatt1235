import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { homesTable, membersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const homes = await db.select().from(homesTable).orderBy(asc(homesTable.village), asc(homesTable.faliya));
    const members = await db.select().from(membersTable);

    const result = homes.map((home) => ({
      ...home,
      address: {
        house_no: home.house_no,
        faliya: home.faliya,
        village: home.village,
      },
      members: members.filter((m) => m.home_id === home.id).sort((a, b) => a.sr_no - b.sr_no),
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Get homes error");
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", requireAuth, requireRole("home_admin"), async (req, res) => {
  try {
    const { kutumb_vada_name, kutumb_vada_address, house_no, faliya, village, members } = req.body;

    if (!kutumb_vada_name || !kutumb_vada_address || !house_no || !faliya || !village) {
      res.status(400).json({ error: "All home fields are required" });
      return;
    }

    const [home] = await db.insert(homesTable).values({
      kutumb_vada_name,
      kutumb_vada_address,
      house_no,
      faliya,
      village,
    }).returning();

    const insertedMembers = [];
    if (members && Array.isArray(members) && members.length > 0) {
      for (const m of members) {
        const [member] = await db.insert(membersTable).values({
          home_id: home.id,
          sr_no: m.sr_no,
          name: m.name,
          dob: m.dob || null,
          occupation: m.occupation || null,
          relation: m.relation,
          marital_status: m.marital_status || "unmarried",
          mobile: m.mobile || null,
        }).returning();
        insertedMembers.push(member);
      }
    }

    res.status(201).json({
      ...home,
      address: { house_no: home.house_no, faliya: home.faliya, village: home.village },
      members: insertedMembers,
    });
  } catch (err) {
    req.log.error({ err }, "Create home error");
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const homes = await db.select().from(homesTable).where(eq(homesTable.id, id)).limit(1);

    if (homes.length === 0) {
      res.status(404).json({ error: "Home not found" });
      return;
    }

    const home = homes[0];
    const members = await db.select().from(membersTable).where(eq(membersTable.home_id, id));

    res.json({
      ...home,
      address: { house_no: home.house_no, faliya: home.faliya, village: home.village },
      members: members.sort((a, b) => a.sr_no - b.sr_no),
    });
  } catch (err) {
    req.log.error({ err }, "Get home error");
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:id/members", requireAuth, requireRole("home_admin"), async (req, res) => {
  try {
    const home_id = parseInt(req.params.id);
    const homes = await db.select().from(homesTable).where(eq(homesTable.id, home_id)).limit(1);

    if (homes.length === 0) {
      res.status(404).json({ error: "Home not found" });
      return;
    }

    const { sr_no, name, dob, occupation, relation, marital_status, mobile } = req.body;

    if (!name || !relation) {
      res.status(400).json({ error: "name and relation required" });
      return;
    }

    const [member] = await db.insert(membersTable).values({
      home_id,
      sr_no: sr_no || 1,
      name,
      dob: dob || null,
      occupation: occupation || null,
      relation,
      marital_status: marital_status || "unmarried",
      mobile: mobile || null,
    }).returning();

    res.status(201).json(member);
  } catch (err) {
    req.log.error({ err }, "Add member error");
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
