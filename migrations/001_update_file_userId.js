import mongoose from "mongoose";
import "dotenv/config";

(async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("Missing MONGO_URI in .env");

    await mongoose.connect(uri);

    const result = await mongoose.connection.db
      .collection("files")
      .updateMany(
        { user: { $exists: true } },
        [
          { $set: { userId: "$user" } },
          { $unset: "user" }
        ],
        { updatePipeline: true }
      );

    console.log("Modified:", result.modifiedCount);
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
})();
