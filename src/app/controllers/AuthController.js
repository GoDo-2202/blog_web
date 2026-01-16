import User from "../models/User.js";
import { signAccessToken, signRefreshToken } from "../../utils/jwt.js";
import { catchAsync } from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ERROR_MESSAGES } from "../constants/errors.js";
import { SUCCESS_MESSAGES } from "../constants/success.js";
import { CONSTANTS } from "../constants/constants.js"
import { CRYPTO } from "../constants/crypto.js"

const hashToken = (token) => {
  return crypto.createHash(CRYPTO.HASH_ALGO).update(token).digest(CRYPTO.HASH_ENCODING);
};

class AuthController {
  // REGISTER
  register = catchAsync(async (req, res, next) => {
    const { username, password, email, firstName, lastName, phone } = req.body;

    // Validate cơ bản
    if (!username || !password) {
      return next(new AppError(ERROR_MESSAGES.AUTH.INVALID_LOGIN, 400));
    }

    // Check username tồn tại
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return next(new AppError(ERROR_MESSAGES.USER.USERNAME_USED, 400));

    // Check email tồn tại
    let normalizedEmail = email ? email.trim().toLowerCase() : undefined;

    if (normalizedEmail) {
      const emailExists = await User.findOne({ email: normalizedEmail });
      if (emailExists)
        return next(new AppError(ERROR_MESSAGES.USER.EMAIL_USED, 400));
    }

    // Tạo user mới
    const user = new User({
      username,
      password,
      email: normalizedEmail,
      firstName,
      lastName,
      phone,
    });

    // Sinh token
    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    // Lưu refresh token dạng hash
    user.refreshTokenHash = hashToken(refreshToken);
    await user.save({ validateBeforeSave: false });

    // Ẩn các field nhạy cảm
    user.password = undefined;
    user.refreshTokenHash = undefined;

    res.status(201).json({
      message: SUCCESS_MESSAGES.AUTH.REGISTER_SUCCESS,
      accessToken,
      refreshToken,
      user,
    });
  });

  // LOGIN
  login = catchAsync(async (req, res, next) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username }).select(CONSTANTS.USER_PRIVATE_FIELDS);
    if (!user) throw new AppError(ERROR_MESSAGES.AUTH.INVALID_LOGIN, 400);

    const correct = await user.correctPassword(password);
    if (!correct) throw new AppError(ERROR_MESSAGES.AUTH.INVALID_LOGIN, 400);

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    user.refreshTokenHash = hashToken(refreshToken);
    await user.save({ validateBeforeSave: false });

    user.password = undefined;
    user.refreshTokenHash = undefined;

    res.json({
      message: SUCCESS_MESSAGES.AUTH.LOGIN_SUCCESS,
      accessToken,
      refreshToken,
      user,
    });
  });

  // GET USER INFO
  getMe = catchAsync(async (req, res, next) => {
    res.json({
      message: SUCCESS_MESSAGES.USER.GET_USER_INFO,
      user: req.user,
    });
  });

  refreshToken = catchAsync(async (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError(ERROR_MESSAGES.AUTH.MISSING_REFRESH, 400);
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      throw new AppError(
        ERROR_MESSAGES.AUTH.INVALID_OR_EXPIRED_REFRESH_TOKEN,
        401
      );
    }

    const user = await User.findById(decoded.id).select(CONSTANTS.USER_REFRESH_FIELDS);
    if (!user) throw new AppError(ERROR_MESSAGES.USER.NO_LONGER_EXISTS, 404);

    const hashed = hashToken(refreshToken);

    // ❗ So sánh hash trong DB
    if (hashed !== user.refreshTokenHash) {
      throw new AppError(ERROR_MESSAGES.AUTH.INVALID_REFRESH, 401);
    }

    // Tạo token mới
    const newAccessToken = signAccessToken(user._id);
    const newRefreshToken = signRefreshToken(user._id);

    user.refreshTokenHash = hashToken(newRefreshToken);
    await user.save({ validateBeforeSave: false });

    user.password = undefined;
    user.refreshTokenHash = undefined;

    res.json({
      message: SUCCESS_MESSAGES.AUTH.TOKEN_REFRESH_SUCCESS,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user,
    });
  });
}

export default new AuthController();
