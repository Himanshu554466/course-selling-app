import { Course } from "../models/course.model.js"; 
// Course model ko import karte hain jo database ke saath interact karega.
import { v2 as cloudinary } from 'cloudinary';

export const createCourse = async (req, res) => {
    // Asynchronous function banaya course create karne ke liye.
    
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





