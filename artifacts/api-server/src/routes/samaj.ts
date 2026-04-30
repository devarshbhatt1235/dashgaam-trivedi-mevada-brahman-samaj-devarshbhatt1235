import { Router, type IRouter } from "express";
import { SamajModel, LeaderModel, type LeaderDoc } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router: IRouter = Router();

function serializeSamaj(doc: { _id: { toString(): string }; samaj_name: string }) {
  return { id: doc._id.toString(), samaj_name: doc.samaj_name };
}

function serializeLeader(doc: LeaderDoc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    role: doc.role,
    mobile: doc.mobile ?? null,
    address: doc.address ?? null,
    order: doc.order,
  };
}

router.get("/", async (req, res) => {
  try {
    let samaj = await SamajModel.findOne().lean();
    if (!samaj) {
      const created = await SamajModel.create({ samaj_name: "સમાજ પરિવાર ડિરેક્ટ્રી" });
      samaj = created.toObject();
    }
    res.json(serializeSamaj(samaj));
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

    let samaj = await SamajModel.findOne();
    if (!samaj) {
      samaj = await SamajModel.create({ samaj_name });
    } else {
      samaj.samaj_name = samaj_name;
      await samaj.save();
    }
    res.json(serializeSamaj(samaj.toObject()));
  } catch (err) {
    req.log.error({ err }, "Update samaj error");
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/leaders", async (req, res) => {
  try {
    const leaders = await LeaderModel.find().sort({ order: 1 });
    res.json(leaders.map((l) => serializeLeader(l.toObject() as LeaderDoc)));
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

    const count = await LeaderModel.countDocuments();
    const nextOrder = order ?? count + 1;
    const leader = await LeaderModel.create({
      name, role,
      mobile: mobile || null,
      address: address || null,
      order: nextOrder,
    });
    res.status(201).json(serializeLeader(leader.toObject() as LeaderDoc));
  } catch (err) {
    req.log.error({ err }, "Create leader error");
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/leaders/:id", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const leader = await LeaderModel.findById(id);
    if (!leader) {
      res.status(404).json({ error: "Leader not found" });
      return;
    }

    const { name, role, mobile, address, order } = req.body;
    if (name !== undefined) leader.name = name;
    if (role !== undefined) leader.role = role;
    if (mobile !== undefined) leader.mobile = mobile;
    if (address !== undefined) leader.address = address;
    if (order !== undefined) leader.order = order;
    await leader.save();

    res.json(serializeLeader(leader.toObject() as LeaderDoc));
  } catch (err) {
    req.log.error({ err }, "Update leader error");
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/leaders/:id", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await LeaderModel.findByIdAndDelete(id);
    if (!result) {
      res.status(404).json({ error: "Leader not found" });
      return;
    }
    res.json({ success: true, message: "Leader deleted" });
  } catch (err) {
    req.log.error({ err }, "Delete leader error");
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/leaders/:id/move", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { direction } = req.body;
    if (direction !== "up" && direction !== "down") {
      res.status(400).json({ error: "direction must be 'up' or 'down'" });
      return;
    }

    const leaders = await LeaderModel.find().sort({ order: 1 });
    const idx = leaders.findIndex((l) => l._id.toString() === id);
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
    const tmp = current.order;
    current.order = swap.order;
    swap.order = tmp;
    await current.save();
    await swap.save();

    res.json({ success: true, message: "Moved successfully" });
  } catch (err) {
    req.log.error({ err }, "Move leader error");
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
