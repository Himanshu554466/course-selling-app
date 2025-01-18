import express from "express";
import {createCourse} from "../controllers/course.controller.js";
import { updateCourse } from "../controllers/course.controller.js";

const router = express.Router();

router.post("/create", createCourse); //when we are comming /create then createCourse function 
                                     // start executing
router.put("/update/:courseId",updateCourse);


export default router;