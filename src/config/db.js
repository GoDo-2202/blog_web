import { MongoClient, ServerApiVersion } from 'mongodb';
import mongoose from "mongoose";

const uriLocal = "mongodb://127.0.0.1:27017/blog"
const uri = "mongodb+srv://godobento2202_db_user:1on9P3hco7hcUvJr@cluster0.bfdadyu.mongodb.net/?appName=Cluster0";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uriLocal, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectDB() {
  try {
    await mongoose.connect(uriLocal);
    console.log("MongoDB connected!");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
}

export default connectDB;