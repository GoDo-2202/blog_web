import mongoose from "mongoose";
import "dotenv/config";

(async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("❌ Missing MONGO_URI in .env");
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("✅ Connected!");

    console.log("🔍 Updating Image documents...");

    const one = await mongoose.connection.db.collection("images").findOne();
    console.log(one);

    console.log("DB name:", mongoose.connection.db.databaseName);

    const docs = await mongoose.connection.db
      .collection("images")
      .find({ user: { $exists: true } })
      .toArray();

    console.log("FOUND DOCS:", docs.length);
    console.log("FIRST DOC:", docs[0]);

    const result = await mongoose.connection.db
      .collection("images")
      .updateMany({ user: { $exists: true } }, { $rename: { user: "userId" } });

    console.log(`🎉 Updated ${result.modifiedCount} Image documents`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration error:", err);
    process.exit(1);
  }
})();
