import { Course } from "../models/course.model.js";
// Course model ko import karte hain jo database ke saath interact karega.
import { v2 as cloudinary } from "cloudinary";
import { Purchase } from "../models/purchase.model.js";

export const createCourse = async (req, res) => {
  // Asynchronous function banaya course create karne ke liye.
  const adminId = req.adminId
  const { title, description, price, image } = req.body;
  // Client se aayi request ke body se title, description, aur price extract karte hain.

  console.log(title, description, price, image);
  // Debugging ke liye console pe extracted data ko print karte hain.

  try {
    // Data validation karte hain.
    if (!title || !description || !price) {
      // Agar koi field missing hai, toh 400 error return karte hain.
      return res.status(400).json({ errors: "All fields are required" });
    }

    const { image } = req.files;
    // Request ke saath file (image) ko extract karte hain.

    if (!req.files || Object.keys(req.files).length === 0) {
      // Agar koi file upload nahi hui ho toh error bhejte hain.
      return res.status(400).json({ errors: "No file uploaded" });
    }

    const allowedFormat = ["image/png", "image/jpeg"];
    // Valid file formats define karte hain (PNG aur JPEG allowed hain).

    if (!allowedFormat.includes(image.mimetype)) {
      // Agar file ka format allowed formats me nahi ho toh error bhejte hain.
      return res
        .status(400)
        .json({ errors: "Invalid file format. Only PNG and JPG are allowed" });
    }

    // Cloudinary ke madhyam se file upload karte hain.
    const cloud_response = await cloudinary.uploader.upload(image.tempFilePath);
    // Image ko Cloudinary me upload karte hain aur response ko store karte hain.

    if (!cloud_response || cloud_response.error) {
      // Agar upload me error aaye toh error bhejte hain.
      return res
        .status(400)
        .json({ errors: "Error uploading file to cloudinary" });
    }

    // Course data ko ek object mein organize karte hain.
    const courseData = {
      title,
      description,
      price,
      image: {
        public_id: cloud_response.public_id,
        url: cloud_response.url,
      },
      creatorId:adminId
    };

    // Database mein naya course create karte hain.
    const course = await Course.create(courseData);

    // Agar successful ho jaye, toh success message ke saath response bhejte hain.
    res.json({
      message: "Course created successfully",
      course, // Jo nayi course create hui, uska data bhejte hain.
    });
  } catch (error) {
    // Agar koi error aata hai, toh usse catch karke handle karte hain.
    console.log(error);
    // Error ko console pe print karte hain debugging ke liye.

    res.status(500).json({ error: "Error creating course" });
    // 500 error response bhejte hain client ko.
  }
};

export const updateCourse = async (req, res) => {
  // Yeh function ek existing course ko update karne ke liye banaya gaya hai.
  const adminId = req.adminId //we adding our adminId in our database
  const { courseId } = req.params;
  // URL ke params se `courseId` extract karte hain jo update hone wale course ko identify karega.
  /*   why?
URL ke params me courseId hota hai, jo identify karega ki kaunsa course update karna hai.
Agar courseId nahi hoga, toh pata nahi chalega ki kaunsi entry update karni hai.*/

  const { title, description, price, image } = req.body;
  // Request body se updated data (title, description, price aur image) ko extract karte hain.
  /* why?
Client jo updated data bhejta hai (title, description, price, aur image), use req.body ke through extract karte hain.
Yeh data hi database me update kiya jayega. */

  try {
    const courseSearch = await Course.findById(courseId);
    // Database me course ko search karte hain courseId ke basis par.

    if (!courseSearch) {
      // Agar course nahi milta, toh `404 Course not found` error return karte hain.
      return res.status(404).json({ errors: "Course not found" });
    }

    const course = await Course.findOneAndUpdate(
      { _id: courseId,
        creatorId:adminId, //only admin update the course
       }, // Course ko `courseId` ke basis par find karte hain.
      {
        title, // Title update karte hain.
        description, // Description update karte hain.
        price, // Price update karte hain.
        image: {
          public_id: image?.public_id, // Image ke `public_id` ko update karte hain.
          url: image?.url, // Image ke URL ko update karte hain.
        },
      }
    );
    /* why?
findOneAndUpdate() ka use karke database me course ka data update karte hain.
title, description, aur price ko directly update karte hain.
image field ke public_id aur url ko bhi update karte hain (agar provided hain).
Agar koi field missing hai (image?.public_id), toh error avoid karne ke liye ?. operator ka use kiya.

    */

    res.status(201).json({ message: "Course updated successfully", course });
    // Agar course successfully update ho jaye, toh success message aur updated course ka data bhejte hain.
  } catch (error) {
    res.status(500).json({ errors: "Error in course updating" });
    // Agar koi error aaye, toh client ko `500 Internal Server Error` bhejte hain.

    console.log("Error in course updating ", error);
    // Debugging ke liye error ko console me log karte hain.
  }
};

export const deleteCourse = async (req, res) => {
  // Asynchronous function banaya gaya hai kisi course ko delete karne ke liye.
  const adminId = req.adminId
  const { courseId } = req.params;
  // URL ke params se `courseId` extract karte hain jo delete hone wale course ko identify karega.

  try {
    const course = await Course.findOneAndDelete({
      _id: courseId,
      creatorId:adminId,
    });
    // Database me course ko `courseId` ke basis par dhoondh kar delete karte hain.

    if (!course) {
      // Agar course nahi milta, toh `404 Course not found` error return karte hain.
      return res.status(404).json({ errors: "Course not found" });
    }

    res.status(200).json({ message: "Course deleted successfully" });
    // Agar course successfully delete ho jaye, toh `200 OK` response ke saath success message bhejte hain.
  } catch (error) {
    res.status(500).json({ errors: "Error in course deleting" });
    // Agar koi error aaye, toh `500 Internal Server Error` ka response bhejte hain.

    console.log("Error in course deleting", error);
    // Debugging ke liye error ko console me log karte hain.
  }
};

export const getCourses = async (req, res) => {
  // Yeh function saare courses ko fetch karne ke liye banaya gaya hai.

  try {
    const courses = await Course.find({});
    // Database se saare courses ko fetch karte hain.

    res.status(201).json({ courses });
    // Agar courses successfully mil jayein, toh `201 Created` status ke saath response bhejte hain.
  } catch (error) {
    res.status(500).json({ errors: "Error in getting courses" });
    // Agar koi error aaye, toh `500 Internal Server Error` ka response bhejte hain.

    console.log("error to get courses", error);
    // Debugging ke liye error ko console me log karte hain.
  }
};

export const courseDetails = async (req, res) => {
  // Yeh function specific course ki details fetch karne ke liye banaya gaya hai.

  const { courseId } = req.params;
  // URL ke params se `courseId` ko extract karte hain jo identify karega ki kaunsa course fetch karna hai.

  try {
    const course = await Course.findById(courseId);
    // `courseId` ke basis par database se specific course ko fetch karte hain.

    if (!course) {
      // Agar course nahi milta, toh `404 Not Found` error return karte hain.
      return res.status(404).json({ error: "Course not found" });
    }

    res.status(200).json({ course });
    // Agar course successfully mil jaye, toh `200 OK` status ke saath response bhejte hain.
  } catch (error) {
    res.status(500).json({ errors: "Error in getting course details" });
    // Agar koi error aaye, toh `500 Internal Server Error` ka response bhejte hain.

    console.log("Error in course details", error);
    // Debugging ke liye error ko console me log karte hain.
  }
};

export const buyCourses = async (req, res) => {
  const { userId } = req;
  //  Middleware ke through userId ko `req` object me inject kiya gaya hai, taaki current user ka ID access kiya ja sake.

  const { courseId } = req.params;
  //  URL params se `courseId` ko extract karte hain, jo purchase hone wale course ko uniquely identify karega.

  try {
    const course = await Course.findById(courseId);
    //  Database me `courseId` ke basis par course ko dhoondte hain, taaki ensure kar sakein ki course exist karta hai.

    if (!course) {
      //  Agar course nahi milta, toh `404 Not Found` error return karte hain.
      return res.status(404).json({ errors: "Course not found" });
    }

    // **Check for Existing Purchase**
    const existingPurchase = await Purchase.findOne({ userId, courseId });
    //  Check karte hain ki user ne pehle se yeh course kharida hai ya nahi.

    if (existingPurchase) {
      //  Agar user ne course already purchase kar liya hai, toh `400 Bad Request` error bhejte hain.
      return res
        .status(400)
        .json({ errors: "User has already purchased this course" });
    }

    // **Create New Purchase**
    const newPurchase = Purchase({ userId, courseId });
    //  Naya purchase object banate hain jo user aur course ke IDs ko store karega.

    await newPurchase.save();
    //  Naye purchase ko database me save karte hain.

    res.status(201).json({
      message: "Course purchased successfully",
      newPurchase,
      //  Success message ke saath naye purchase ka data client ko bhejte hain.
    });
  } catch (error) {
    res.status(500).json({ errors: "Error in course buying" });
    //  Agar koi unexpected error aaye, toh `500 Internal Server Error` response bhejte hain.

    console.log("error in course buying ", error);
    //  Debugging ke liye error ko console me log karte hain.
  }
};
