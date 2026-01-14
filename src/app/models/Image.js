import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    urlImage: { type: String, required: true },
    imageType: { type: String, required: true },
    size: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    thumbnail: { type: String },
    dateUpload: { type: Date, default: Date.now },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Image", imageSchema);
