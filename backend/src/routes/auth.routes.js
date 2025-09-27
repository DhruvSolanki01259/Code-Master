import express from "express";
import { login, logout, signin } from "../controllers/auth.controllers.js";

const router = express.Router();

router.get("/signin", signin);
router.get("/login", login);
router.get("/logout", logout);

export default router;
