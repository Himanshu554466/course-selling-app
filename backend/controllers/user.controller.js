import { User } from "../models/user.model.js";
// User model ko import karte hain jo database ke saath interact karega.
import { z } from "zod";
import jwt from "jsonwebtoken";
import { Purchase } from "../models/purchase.model.js";
import bcrypt from "bcryptjs";
import config from "../config.js";
import { Course } from "../models/course.model.js";

// Password ko securely store karne ke liye hashing ka use karte hain, aur bcrypt ek popular library hai.

export const signup = async (req, res) => {
  // Signup functionality banane ke liye asynchronous function define kiya gaya hai.

  const { firstName, lastName, email, password } = req.body;
  // Client se request body me aaya data (firstName, lastName, email, password) extract karte hain jo signup ke liye required hai.

  const userSchema = z.object({
    // Zod library ka use karke ek schema define karte hain jo user input ko validate karega.
    firstName: z
      .string()
      .min(3, { message: "firstName must be atleast 3 char long" }),
    // firstName validate karte hain ki wo kam se kam 3 characters ka ho.

    lastName: z
      .string()
      .min(3, { message: "lastName must be atleast 3 char long" }),
    // lastName validate karte hain ki wo bhi kam se kam 3 characters ka ho.

    email: z.string().email(),
    // Email validate karte hain ki wo ek valid email address ho.

    password: z
      .string()
      .min(6, { message: "password must be atleast 6 char long" }),
    // Password validate karte hain ki wo kam se kam 6 characters ka ho.
  });

  const validatedData = userSchema.safeParse(req.body);
  // Schema ke against user ke input data ko validate karte hain.
  if (!validatedData.success) {
    // Agar validation fail ho jaye, toh 400 Bad Request ka error bhejte hain client ko.
    return res
      .status(400)
      .json({ errors: validatedData.error.issues.map((err) => err.message) });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  // Password ko secure karne ke liye hash karte hain (10 rounds of salting).

  try {
    const existingUser = await User.findOne({ email: email });
    // Check karte hain ki email database me pehle se exist karta hai ya nahi.

    if (existingUser) {
      // Agar email already registered hai, toh error bhejte hain ki "User already exists".
      return res.status(400).json({ errors: "User already exists" });
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    // Naya user object banate hain jo database me store hoga.

    await newUser.save();
    // Naye user ko database me save karte hain.

    res.status(201).json({ message: "Signup succeeded", newUser });
    // Agar signup successful ho jaye, toh success response ke saath naye user ka data bhejte hain.
  } catch (error) {
    res.status(500).json({ errors: "Error in signup" });
    // Agar koi unknown error aaye, toh 500 Internal Server Error response bhejte hain.

    console.log("Error in signup", error);
    // Debugging ke liye error ko console me log karte hain.
  }

  // final

  /*Visualized Workflow:
Client Request → Data sent in the request body.
Data Extraction → Extract firstName, lastName, email, password.
Validation → Validate input data:
If validation fails → 400 Bad Request.
If validation succeeds → Proceed.
Password Hashing → Secure the password using bcrypt.
Check Existing User → Is the email already registered?
Yes → 400 User already exists.
No → Create a new user.
Create User → Prepare a new user object with hashed password.
Save User → Save the user to the database.
Success Response → 201 Signup succeeded.
Error Handling → Log and return errors as needed. */
};

export const login = async (req, res) => {
  // Login functionality banane ke liye asynchronous function define kiya gaya hai.

  const { email, password } = req.body;
  // Client se request body me aayi details (email aur password) ko extract karte hain jo login ke liye required hain.

  try {
    // 1. Find the user by email
    const user = await User.findOne({ email: email });
    // Database me check karte hain ki user ka email exist karta hai ya nahi.

    // 2. Check if the password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user?.password);
    // User ke entered password ko hashed password ke saath compare karte hain bcrypt ka use karke.
    // **Note:** `user?.password` ka use karte hain taaki agar `user` null ho toh error avoid ho sake.

    if (!user || !isPasswordCorrect) {
      // Agar email ya password galat ho toh `403 Forbidden` error response bhejte hain.
      return res.status(403).json({ errors: "Invalid credentials" });
    }

    // 3. Generate a JWT token
    const token = jwt.sign(
      {
        id: user._id, // Token payload me user ka unique ID add karte hain.
      },
      config.JWT_USER_PASSWORD,
      { expiresIn: "1d" } // Secret key JWT ko sign karne ke liye.
    );
    //JWT token user ke authentication ke liye generate karte hain.
    // Is token ka use baad me protected routes access karne ke liye hoga.

    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      httpOnly: true, //  can't be accsed via js directly
      secure: process.env.NODE_ENV === "production", // true for https only
      sameSite: "Strict", // CSRF attacks
    };
    // 4. Store the token in a cookie
    res.cookie("jwt", token, cookieOptions);


    // JWT token ko client ke browser me securely store karte hain cookies ke madhyam se.

    // 5. Respond with success and token
    res.status(201).json({ message: "Login successful", user, token });
    // Agar email aur password dono sahi hain, toh success response ke saath user details bhejte hain.
  } catch (error) {
    res.status(500).json({ errors: "Error in login" });
    // Agar koi unexpected error aaye, toh 500 Internal Server Error response bhejte hain.

    console.log("error in login", error);
    // Debugging ke liye error ko console me log karte hain.
  }
};

export const logout = (req, res) => {
  try {
    if(!req.cookies.jwt){
        return res.status(401).json({errors: "KIndly login first"})
    }
    res.clearCookie("jwt", { httpOnly: true, secure: true });
    // Logout karte time JWT cookie ko clear karte hain.

    res.setHeader("Cache-Control", "no-store");
    // Cache ko disable karte hain taaki sensitive data access na ho.

    res.status(200).json({ message: "Logged out successfully" });
    // Logout hone ke baad success message bhejte hain.
  } catch (error) {
    res.status(500).json({ errors: "Error in logout" });
    // Agar logout ke dauraan error aaye, toh 500 Internal Server Error return karte hain.

    console.log("Error in logout", error);
    // Debugging ke liye error console me log karte hain.
  }
};

export const purchases = async (req, res) => {
  const userId = req.userId;
  // Middleware ke through `userId` ko request object me inject kiya gaya hai.
  // Ye user ke purchases ko identify karne ke liye use hota hai.

  try {
    const purchased = await Purchase.find({ userId });
    // Purchase collection me `userId` ke basis par user ke saare purchases fetch karte hain.

    let purchasedCourseId = [];
    // User ke purchased courses ke IDs ko collect karne ke liye empty array banate hain.

    for (let i = 0; i < purchased.length; i++) {
      purchasedCourseId.push(purchased[i].courseId);
    }
    // Purchased items ke course IDs ko array me push karte hain.

    const courseData = await Course.find({
      _id: { $in: purchasedCourseId },
    });
    // Course collection me un IDs ke basis par course details fetch karte hain jo user ne purchase ki hain.

    res.status(200).json({ purchased, courseData });
    // Success response ke saath purchased items aur corresponding course details ko client ko bhejte hain.

  } catch (error) {
    res.status(500).json({ errors: "Error in purchases" });
    // Agar koi error aaye toh `500 Internal Server Error` response bhejte hain.

    console.log("Error in purchase", error);
    // Debugging ke liye error ko console me log karte hain.
  }
};
