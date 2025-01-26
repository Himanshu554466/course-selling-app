import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose";
import courseRoute from "./routes/course.route.js";
import userRoute from "./routes/user.route.js";
import adminRoute from "./routes/admin.route.js"
import fileUpload from "express-fileupload";
import { v2 as cloudinary } from 'cloudinary';
import cookieParser from "cookie-parser";

const app = express()
dotenv.config();

//middleware for parsing the json data
app.use(express.json());
app.use(cookieParser());
app.use(
    fileUpload({
      useTempFiles: true,
      tempFileDir: "/tmp/",
    })
  );

  
//cloudinary Configuration setup
cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
  });

const port = process.env.PORT || 3000;
const DB_URI = process.env.MONGO_URI;

try {
    await mongoose.connect(DB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// defining routes
app.use("/api/v1/course", courseRoute); //v1 represent first version,it,s a standard way
app.use("/api/v1/user", userRoute);
app.use("/api/v1/admin", adminRoute);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})