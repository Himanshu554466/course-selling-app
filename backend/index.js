import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose";

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})