import express from "express";
// **Why?** Express router ka use karte hain routes define karne ke liye.

import {
  buyCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourses,
  courseDetails,
} from "../controllers/course.controller.js";
// **Why?** Course-related controllers ko import karte hain jo corresponding functions handle karenge.

import userMiddleware from "../middlewares/user.mid.js";
// **Why?** Middleware ko import karte hain jo token verify karega protected routes ke liye.

const router = express.Router();
// **Why?** Router instance create karte hain taaki routes ko manage kiya ja sake.

router.post("/create", createCourse);
// **Why?** `/create` route par nayi course banane ke liye `createCourse` function call hota hai.

router.put("/update/:courseId", updateCourse);
// **Why?** `/update/:courseId` par course ko update karne ke liye `updateCourse` function call hota hai.
// `:courseId` ka use dynamic parameter ke liye hota hai, jo course ko uniquely identify karega.

router.delete("/delete/:courseId", deleteCourse);
// **Why?** `/delete/:courseId` par specific course ko delete karne ke liye `deleteCourse` function call hota hai.

router.get("/courses", getCourses);
// **Why?** `/courses` route par saare courses ko fetch karne ke liye `getCourses` function call hota hai.

router.get("/:courseId", courseDetails);
// **Why?** `/:courseId` par specific course ki details fetch karne ke liye `courseDetails` function call hota hai.

router.post("/buy/:courseId", userMiddleware, buyCourses);
// **Why?** `/buy/:courseId` ek protected route hai.  
// Pehle `userMiddleware` ke through token verify hota hai, aur phir `buyCourses` function execute hota hai.

export default router;
// **Why?** Router ko export karte hain taaki isko app.js ya main file me include kiya ja sake.
