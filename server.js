import {config} from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";

config({
    path: "./.env",
});

const port = process.env.PORT || 4000;
const mongoURI = process.env.MONGO_URI || "";
connectDB(mongoURI);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on: ${process.env.PORT}`);
});               
