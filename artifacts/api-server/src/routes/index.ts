import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import samajRouter from "./samaj";
import homesRouter from "./homes";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/samaj", samajRouter);
router.use("/homes", homesRouter);

export default router;
