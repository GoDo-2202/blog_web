import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  password: String,
  email: String,
  phone: String,
  avatar: String,
  loginType: String,
  address: String
});

export default mongoose.model("User", UserSchema);