import { Router, type IRouter } from "express";
import { HomeModel, type HomeDoc, type EmbeddedMember } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router: IRouter = Router();

function serializeMember(homeId: string, m: EmbeddedMember) {
  return {
    id: m._id.toString(),
    home_id: homeId,
    sr_no: m.sr_no,
    name: m.name,
    dob: m.dob ?? null,
    occupation: m.occupation ?? null,
    relation: m.relation,
    marital_status: m.marital_status,
    mobile: m.mobile ?? null,
    education: m.education ?? null,
    qualification: m.qualification ?? null,
  };
}

function serializeHome(doc: HomeDoc) {
  const id = doc._id.toString();
  return {
    id,
    kutumb_vada_name: doc.kutumb_vada_name,
    kutumb_vada_address: doc.kutumb_vada_address,
    house_no: doc.house_no,
    faliya: doc.faliya,
    village: doc.village,
    current_house_no: doc.current_house_no ?? null,
    current_area: doc.current_area ?? null,
    current_landmark: doc.current_landmark ?? null,
    current_city: doc.current_city ?? null,
    current_district: doc.current_district ?? null,
    current_pincode: doc.current_pincode ?? null,
    address: {
      house_no: doc.house_no,
      faliya: doc.faliya,
      village: doc.village,
    },
    current_address: {
      current_house_no: doc.current_house_no ?? null,
      current_area: doc.current_area ?? null,
      current_landmark: doc.current_landmark ?? null,
      current_city: doc.current_city ?? null,
      current_district: doc.current_district ?? null,
      current_pincode: doc.current_pincode ?? null,
    },
    members: (doc.members as EmbeddedMember[])
      .slice()
      .sort((a, b) => a.sr_no - b.sr_no)
      .map((m) => serializeMember(id, m)),
  };
}

router.get("/", async (req, res) => {
  try {
    const homes = await HomeModel.find().sort({ village: 1, faliya: 1 });
    res.json(homes.map((h) => serializeHome(h.toObject() as HomeDoc)));
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

    const memberArray = Array.isArray(members)
      ? members.map((m) => ({
          sr_no: m.sr_no,
          name: m.name,
          dob: m.dob || null,
          occupation: m.occupation || null,
          relation: m.relation,
          marital_status: m.marital_status || "unmarried",
          mobile: m.mobile || null,
          education: m.education || null,
          qualification: m.qualification || null,
        }))
      : [];

    const home = await HomeModel.create({
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
      members: memberArray,
    });

    res.status(201).json(serializeHome(home.toObject() as HomeDoc));
  } catch (err) {
    req.log.error({ err }, "Create home error");
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const home = await HomeModel.findById(req.params.id);
    if (!home) {
      res.status(404).json({ error: "Home not found" });
      return;
    }
    res.json(serializeHome(home.toObject() as HomeDoc));
  } catch (err) {
    req.log.error({ err }, "Get home error");
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const home = await HomeModel.findById(req.params.id);
    if (!home) {
      res.status(404).json({ error: "Home not found" });
      return;
    }

    const fields = [
      "kutumb_vada_name", "kutumb_vada_address",
      "house_no", "faliya", "village",
      "current_house_no", "current_area", "current_landmark",
      "current_city", "current_district", "current_pincode",
    ] as const;

    for (const f of fields) {
      if (req.body[f] !== undefined) (home as any)[f] = req.body[f] ?? null;
    }

    await home.save();
    res.json(serializeHome(home.toObject() as HomeDoc));
  } catch (err) {
    req.log.error({ err }, "Update home error");
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const result = await HomeModel.findByIdAndDelete(req.params.id);
    if (!result) {
      res.status(404).json({ error: "Home not found" });
      return;
    }
    res.json({ success: true, message: "Home and all members deleted" });
  } catch (err) {
    req.log.error({ err }, "Delete home error");
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:id/members", requireAuth, requireRole("home_admin"), async (req, res) => {
  try {
    const home = await HomeModel.findById(req.params.id);
    if (!home) {
      res.status(404).json({ error: "Home not found" });
      return;
    }

    const { sr_no, name, dob, occupation, relation, marital_status, mobile, education, qualification } = req.body;
    if (!name || !relation) {
      res.status(400).json({ error: "name and relation required" });
      return;
    }

    home.members.push({
      sr_no: sr_no || home.members.length + 1,
      name,
      dob: dob || null,
      occupation: occupation || null,
      relation,
      marital_status: marital_status || "unmarried",
      mobile: mobile || null,
      education: education || null,
      qualification: qualification || null,
    } as any);

    await home.save();
    const added = home.members[home.members.length - 1] as EmbeddedMember;
    res.status(201).json(serializeMember(home._id.toString(), added));
  } catch (err) {
    req.log.error({ err }, "Add member error");
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id/members/:memberId", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const home = await HomeModel.findById(req.params.id);
    if (!home) {
      res.status(404).json({ error: "Home not found" });
      return;
    }

    const member = (home.members as any).id(req.params.memberId) as EmbeddedMember | null;
    if (!member) {
      res.status(404).json({ error: "Member not found" });
      return;
    }

    const fields = [
      "sr_no", "name", "dob", "occupation", "relation",
      "marital_status", "mobile", "education", "qualification",
    ] as const;
    for (const f of fields) {
      if (req.body[f] !== undefined) (member as any)[f] = req.body[f] ?? null;
    }

    await home.save();
    res.json(serializeMember(home._id.toString(), member));
  } catch (err) {
    req.log.error({ err }, "Update member error");
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id/members/:memberId", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const home = await HomeModel.findById(req.params.id);
    if (!home) {
      res.status(404).json({ error: "Home not found" });
      return;
    }

    const member = (home.members as any).id(req.params.memberId);
    if (!member) {
      res.status(404).json({ error: "Member not found" });
      return;
    }
    member.deleteOne();
    await home.save();

    res.json({ success: true, message: "Member deleted" });
  } catch (err) {
    req.log.error({ err }, "Delete member error");
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
