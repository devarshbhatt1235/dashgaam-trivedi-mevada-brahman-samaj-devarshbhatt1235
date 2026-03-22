import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { samajTable, leadersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const rows = await db.select().from(samajTable).limit(1);
    if (rows.length === 0) {
      const [created] = await db.insert(samajTable).values({ samaj_name: "સમાજ પરિવાર ડિરેક્ટ્રી" }).returning();
      res.json(created);
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "Get samaj error");
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const { samaj_name } = req.body;
    if (!samaj_name) {
      res.status(400).json({ error: "samaj_name required" });
      return;
    }

    const existing = await db.select().from(samajTable).limit(1);
    if (existing.length === 0) {
      const [created] = await db.insert(samajTable).values({ samaj_name }).returning();
      res.json(created);
      return;
    }

    const [updated] = await db.update(samajTable).set({ samaj_name }).where(eq(samajTable.id, existing[0].id)).returning();
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Update samaj error");
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/leaders", async (req, res) => {
  try {
    const leaders = await db.select().from(leadersTable).orderBy(asc(leadersTable.order));
    res.json(leaders);
  } catch (err) {
    req.log.error({ err }, "Get leaders error");
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/leaders", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const { name, role, mobile, address, order } = req.body;
    if (!name || !role) {
      res.status(400).json({ error: "name and role required" });
      return;
    }

    const allLeaders = await db.select().from(leadersTable);
    const nextOrder = order ?? allLeaders.length + 1;

    const [leader] = await db.insert(leadersTable).values({ name, role, mobile, address, order: nextOrder }).returning();
    res.status(201).json(leader);
  } catch (err) {
    req.log.error({ err }, "Create leader error");
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/leaders/:id", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, role, mobile, address, order } = req.body;

    const existing = await db.select().from(leadersTable).where(eq(leadersTable.id, id)).limit(1);
    if (existing.length === 0) {
      res.status(404).json({ error: "Leader not found" });
      return;
    }

    const updates: Partial<typeof existing[0]> = {};
    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role;
    if (mobile !== undefined) updates.mobile = mobile;
    if (address !== undefined) updates.address = address;
    if (order !== undefined) updates.order = order;

    const [updated] = await db.update(leadersTable).set(updates).where(eq(leadersTable.id, id)).returning();
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Update leader error");
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/leaders/:id", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await db.select().from(leadersTable).where(eq(leadersTable.id, id)).limit(1);
    if (existing.length === 0) {
      res.status(404).json({ error: "Leader not found" });
      return;
    }
    await db.delete(leadersTable).where(eq(leadersTable.id, id));
    res.json({ success: true, message: "Leader deleted" });
  } catch (err) {
    req.log.error({ err }, "Delete leader error");
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/leaders/:id/move", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { direction } = req.body;

    if (direction !== "up" && direction !== "down") {
      res.status(400).json({ error: "direction must be 'up' or 'down'" });
      return;
    }

    const leaders = await db.select().from(leadersTable).orderBy(asc(leadersTable.order));
    const idx = leaders.findIndex((l) => l.id === id);

    if (idx === -1) {
      res.status(404).json({ error: "Leader not found" });
      return;
    }

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= leaders.length) {
      res.json({ success: true, message: "Already at boundary" });
      return;
    }

    const current = leaders[idx];
    const swap = leaders[swapIdx];

    await db.update(leadersTable).set({ order: swap.order }).where(eq(leadersTable.id, current.id));
    await db.update(leadersTable).set({ order: current.order }).where(eq(leadersTable.id, swap.id));

    res.json({ success: true, message: "Moved successfully" });
  } catch (err) {
    req.log.error({ err }, "Move leader error");
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
