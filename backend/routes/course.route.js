import express from "express";
import {createCourse} from "../controllers/course.controller.js";

const router = express.Router();

router.post("/create", createCourse); //when we are comming /create then createCourse function 
                                     // start executing

export default router;