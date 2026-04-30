import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "@workspace/db";
import { requireAuth, JWT_SECRET } from "../middlewares/auth.js";

const router: IRouter = Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: "Username and password required" });
      return;
    }

    const user = await UserModel.findOne({ username }).lean();
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const payload = { id: user._id.toString(), username: user.username, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, user: payload });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  res.json(req.user);
});

export default router;
