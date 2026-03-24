import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { homesTable, membersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router: IRouter = Router();

function buildHomeResponse(home: typeof homesTable.$inferSelect, members: (typeof membersTable.$inferSelect)[]) {
  return {
    ...home,
    address: {
      house_no: home.house_no,
      faliya: home.faliya,
      village: home.village,
    },
    current_address: {
      current_house_no: home.current_house_no ?? null,
      current_area: home.current_area ?? null,
      current_landmark: home.current_landmark ?? null,
      current_city: home.current_city ?? null,
      current_district: home.current_district ?? null,
      current_pincode: home.current_pincode ?? null,
    },
    members: members.filter((m) => m.home_id === home.id).sort((a, b) => a.sr_no - b.sr_no),
  };
}

router.get("/", async (req, res) => {
  try {
    const homes = await db.select().from(homesTable).orderBy(asc(homesTable.village), asc(homesTable.faliya));
    const members = await db.select().from(membersTable);
    res.json(homes.map((h) => buildHomeResponse(h, members)));
  } catch (err) {
    req.log.error({ err }, "Get homes error");
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", requireAuth, requireRole("home_admin"), async (req, res) => {
  try {
    const {
      kutumb_vada_name, kutumb_vada_address, house_no, faliya, village, members,
      current_house_no, current_area, current_landmark, current_city, current_district, current_pincode,
    } = req.body;

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
      current_house_no: current_house_no || null,
      current_area: current_area || null,
      current_landmark: current_landmark || null,
      current_city: current_city || null,
      current_district: current_district || null,
      current_pincode: current_pincode || null,
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

router.put("/:id", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await db.select().from(homesTable).where(eq(homesTable.id, id)).limit(1);

    if (existing.length === 0) {
      res.status(404).json({ error: "Home not found" });
      return;
    }

    const { kutumb_vada_name, kutumb_vada_address, house_no, faliya, village } = req.body;
    const updates: Partial<typeof existing[0]> = {};

    if (kutumb_vada_name !== undefined) updates.kutumb_vada_name = kutumb_vada_name;
    if (kutumb_vada_address !== undefined) updates.kutumb_vada_address = kutumb_vada_address;
    if (house_no !== undefined) updates.house_no = house_no;
    if (faliya !== undefined) updates.faliya = faliya;
    if (village !== undefined) updates.village = village;

    const [updated] = await db.update(homesTable).set(updates).where(eq(homesTable.id, id)).returning();
    const members = await db.select().from(membersTable).where(eq(membersTable.home_id, id));

    res.json({
      ...updated,
      address: { house_no: updated.house_no, faliya: updated.faliya, village: updated.village },
      members: members.sort((a, b) => a.sr_no - b.sr_no),
    });
  } catch (err) {
    req.log.error({ err }, "Update home error");
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await db.select().from(homesTable).where(eq(homesTable.id, id)).limit(1);

    if (existing.length === 0) {
      res.status(404).json({ error: "Home not found" });
      return;
    }

    await db.delete(membersTable).where(eq(membersTable.home_id, id));
    await db.delete(homesTable).where(eq(homesTable.id, id));

    res.json({ success: true, message: "Home and all members deleted" });
  } catch (err) {
    req.log.error({ err }, "Delete home error");
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

router.put("/:id/members/:memberId", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId);
    const home_id = parseInt(req.params.id);

    const existing = await db.select().from(membersTable)
      .where(eq(membersTable.id, memberId)).limit(1);

    if (existing.length === 0 || existing[0].home_id !== home_id) {
      res.status(404).json({ error: "Member not found" });
      return;
    }

    const { sr_no, name, dob, occupation, relation, marital_status, mobile } = req.body;
    const updates: Partial<typeof existing[0]> = {};

    if (sr_no !== undefined) updates.sr_no = sr_no;
    if (name !== undefined) updates.name = name;
    if (dob !== undefined) updates.dob = dob;
    if (occupation !== undefined) updates.occupation = occupation;
    if (relation !== undefined) updates.relation = relation;
    if (marital_status !== undefined) updates.marital_status = marital_status;
    if (mobile !== undefined) updates.mobile = mobile;

    const [updated] = await db.update(membersTable).set(updates)
      .where(eq(membersTable.id, memberId)).returning();

    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Update member error");
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id/members/:memberId", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId);
    const home_id = parseInt(req.params.id);

    const existing = await db.select().from(membersTable)
      .where(eq(membersTable.id, memberId)).limit(1);

    if (existing.length === 0 || existing[0].home_id !== home_id) {
      res.status(404).json({ error: "Member not found" });
      return;
    }

    await db.delete(membersTable).where(eq(membersTable.id, memberId));

    res.json({ success: true, message: "Member deleted" });
  } catch (err) {
    req.log.error({ err }, "Delete member error");
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
