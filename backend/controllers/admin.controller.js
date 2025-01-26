import bcrypt from "bcryptjs";
// Password ko securely hash aur compare karne ke liye bcrypt library ka use kiya jata hai.

import jwt from "jsonwebtoken";
// Authentication ke liye token-based system implement karne ke liye JWT ka use hota hai.

import { z } from "zod";
// User input ko validate karne ke liye Zod library ka use kiya gaya hai.

import config from "../config.js";
// JWT ke secret keys aur configuration values ko access karne ke liye config file import ki jati hai.

import { Admin } from "../models/admin.model.js";
// Admin ke database se interact karne ke liye Admin model ko import kiya gaya hai.


export const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  // Client ke request body se user ke data ko extract karte hain.

  const adminSchema = z.object({
    // Input validation ke liye Zod ka schema banaya gaya hai.
    firstName: z.string().min(3, { message: "First name must be at least 3 characters long" }),
    lastName: z.string().min(3, { message: "Last name must be at least 3 characters long" }),
    email: z.string().email(), // Email ko validate karte hain ki sahi format me ho.
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  });

  const validatedData = adminSchema.safeParse(req.body);
  // User ke input ko schema ke against validate karte hain.

  if (!validatedData.success) {
    // Agar validation fail ho, toh error response ke saath client ko inform karte hain.
    return res.status(400).json({ errors: validatedData.error.issues.map((err) => err.message) });
  }

  try {
    const existingAdmin = await Admin.findOne({ email });
    // Check karte hain ki admin ka email already exist karta hai ya nahi.

    if (existingAdmin) {
      // Agar admin exist karta hai, toh 400 Bad Request error bhejte hain.
      return res.status(400).json({ errors: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Password ko hash karte hain taaki securely store kiya ja sake.

    const newAdmin = new Admin({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    // Naye admin ka object banate hain aur hashed password ko store karte hain.

    await newAdmin.save();
    // Admin ko database me save karte hain.

    res.status(201).json({ message: "Signup succeeded", newAdmin });
    // Successful signup ke baad client ko success response bhejte hain.
  } catch (error) {
    res.status(500).json({ errors: "Error in signup" });
    // Agar koi unexpected error aaye, toh 500 Internal Server Error return karte hain.

    console.log("Error in signup", error);
    // Debugging ke liye error ko console me log karte hain.
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;
  // Client ke request body se email aur password ko extract karte hain.

  try {
    const admin = await Admin.findOne({ email });
    // Email ke basis par database me admin ko find karte hain.

    if (!admin) {
      // Agar email database me nahi hai, toh error return karte hain.
      return res.status(403).json({ errors: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    // Client ke entered password ko hashed password ke saath compare karte hain.

    if (!isPasswordCorrect) {
      // Agar password incorrect ho, toh error return karte hain.
      return res.status(403).json({ errors: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id }, // Token me admin ka unique ID store karte hain.
      config.JWT_ADMIN_PASSWORD, // Secret key ka use karke token sign karte hain.
      { expiresIn: "1d" } // Token ka expiration time 1 din set karte hain.
    );

    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 din ke liye valid.
      httpOnly: true, // Cookie ko JavaScript ke through access karne se rokta hai.
      secure: process.env.NODE_ENV === "production", // HTTPS connection ke liye cookie secure hoti hai.
      sameSite: "Strict", // CSRF attacks ko prevent karta hai.
    };

    res.cookie("jwt", token, cookieOptions);
    // JWT token ko securely client ke browser cookie me store karte hain.

    res.status(201).json({ message: "Login successful", admin, token });
    // Login success hone par admin details aur token bhejte hain.
  } catch (error) {
    res.status(500).json({ errors: "Error in login" });
    // Agar koi unexpected error aaye, toh 500 Internal Server Error return karte hain.

    console.log("Error in login", error);
    // Debugging ke liye error console me log karte hain.
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
