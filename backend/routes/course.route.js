import express from "express";
import {createCourse} from "../controllers/course.controller.js";
import { updateCourse } from "../controllers/course.controller.js";
import { deleteCourse } from "../controllers/course.controller.js";
import { getCourses} from "../controllers/course.controller.js";
import { courseDetails } from "../controllers/course.controller.js";


const router = express.Router();

router.post("/create", createCourse); //when we are comming /create then createCourse function 
                                     // start executing
router.put("/update/:courseId",updateCourse);
router.delete("/delete/:courseId",deleteCourse);

router.get("/courses", getCourses);
router.get("/:courseId", courseDetails);

export default router;