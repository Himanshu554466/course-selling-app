import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose";
import courseRoute from "./routes/course.route.js";

const app = express()
dotenv.config();
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})