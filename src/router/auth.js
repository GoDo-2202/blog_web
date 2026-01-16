import express from "express";
import authController from "../app/controllers/AuthController.js";
import { protect } from "../app/middleware/authMiddleware.js";

import { AUTH_PATH } from "../app/constants/apiPaths.js";

import { 
  apiLimiter, 
  loginLimiter, 
  cooldown,
} from "../app/middleware/security.js";

const router = express.Router();

router.post(AUTH_PATH.REGISTER, apiLimiter,authController.register);
router.post(AUTH_PATH.LOGIN, loginLimiter, authController.login);
router.get(AUTH_PATH.ME, protect, apiLimiter, authController.getMe);
router.post(AUTH_PATH.REFRESH_TOKEN, apiLimiter, authController.refreshToken)

export default router;