import { Router } from "express";
import {
  getProfile,
  logOut,
  signInManual,
  signUpManual,
  verifyUser,
} from "../controller/user.controller.js";
import { authenticateUser } from "../middleware/jwt.middleware.js";

const router = Router();

router.post("/signup", signUpManual);
router.post("/signin", signInManual);
router.post("/verify/:id", verifyUser);
router.get("/profile", authenticateUser, getProfile);
router.get("/logout", authenticateUser, logOut);
export default router;
