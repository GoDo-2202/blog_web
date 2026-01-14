import mongoose from "mongoose";

const Schema = mongoose.Schema;

const NewsSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("News", NewsSchema);
