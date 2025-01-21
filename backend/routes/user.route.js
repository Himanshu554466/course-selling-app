import express from "express";
import { login, signup,logout} from "../controllers/user.controller.js";


const router = express.Router();
router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.post("")

export default router;