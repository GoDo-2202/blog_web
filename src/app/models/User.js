import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { USER_ROLES } from "../constants/roles.js";

const UserSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
    },

    phone: String,
    avatar: String,
    loginType: String,
    address: String,
    refreshTokenHash: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
    },
  },
  { timestamps: true }
);

// ⭐ Chuẩn nhất – không lỗi
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.correctPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", UserSchema);
