import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    urlFile: { type: String, required: true },
    fileType: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    dateUpload: { type: Date, default: Date.now },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    thumbnail: { type: String, default: null },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("File", fileSchema);