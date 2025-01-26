import express from "express";
// **Why?** Express router ka use karte hain routes define karne ke liye.

import adminMiddleware from "../middlewares/admin.mid.js";
// **Why?** Admin middleware ko import karte hain jo ensure karega ki sirf authorized admins hi restricted operations perform kar sakte hain.

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
// **Why?** Middleware ko import karte hain jo user ke token ko verify karega aur protected routes ko access karne dega.

const router = express.Router();
// **Why?** Router instance create karte hain taaki routes ko manage kiya ja sake.

router.post("/create", adminMiddleware, createCourse);
// **Why?** `/create` route par nayi course banane ke liye `createCourse` function call hota hai.
// **Admin Protection:** Admin middleware check karta hai ki request karne wala user admin hai ya nahi.
// Agar admin nahi hai, toh unauthorized error (403) return hoti hai. Agar admin hai, toh course creation execute hota hai.

router.put("/update/:courseId", adminMiddleware, updateCourse);
// **Why?** `/update/:courseId` par course ko update karne ke liye `updateCourse` function call hota hai.
// **Admin Protection:** Admin middleware ensure karta hai ki sirf authorized admins hi course details ko update kar saken.
// Agar admin authenticated hai, toh update request proceed hoti hai.

router.delete("/delete/:courseId", adminMiddleware, deleteCourse);
// **Why?** `/delete/:courseId` par specific course ko delete karne ke liye `deleteCourse` function call hota hai.
// **Admin Protection:** Admin middleware verify karta hai ki user admin hai ya nahi.
// Sirf admin hi course ko delete kar sakta hai. Unauthorized users ko 403 error milegi.

router.get("/courses", getCourses);
// **Why?** `/courses` route par saare courses ko fetch karne ke liye `getCourses` function call hota hai.
// Is route ko public access ke liye rakha gaya hai, toh yaha middleware ki zarurat nahi hai.

router.get("/:courseId", courseDetails);
// **Why?** `/:courseId` par specific course ki details fetch karne ke liye `courseDetails` function call hota hai.
// Ye route bhi public access ke liye hai, toh middleware ki zarurat nahi hai.

router.post("/buy/:courseId", userMiddleware, buyCourses);
// **Why?** `/buy/:courseId` ek protected route hai.
// Pehle `userMiddleware` user ke token ko verify karta hai, aur agar token valid hai, toh `buyCourses` function execute hota hai.

export default router;
// **Why?** Router ko export karte hain taaki isko app.js ya main file me include kiya ja sake.
