import express from "express";
import userController from "../app/controllers/UserController.js";
import {
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  paginationValidator,
} from "../app/validators/userValidator.js";
import { validateRequest } from "../app/middleware/validateRequest.js";
import {
  uploadAvatar,
  uploadSingle,
  uploadFiles,
} from "../app/middleware/multer.js";

import { protect, restrictTo } from "../app/middleware/authMiddleware.js";

import { USER_ROLES } from "../app/constants/roles.js";

import { USER_PATH, ID_PARAM, ROOT_PATH } from "../app/constants/apiPaths.js";

import { CONSTANTS } from "../app/constants/constants.js";

import { 
  apiLimiter,
  checkOwner
} from "../app/middleware/security.js";

const router = express.Router();

router.get(ROOT_PATH, protect, apiLimiter, paginationValidator, validateRequest, userController.index);

router.post(
  ROOT_PATH,
  apiLimiter,
  uploadAvatar.single(CONSTANTS.AVATAR),
  createUserValidator,
  validateRequest,
  userController.post
);

// Update user
router.put(ID_PARAM, protect, updateUserValidator, apiLimiter, validateRequest, userController.put);

// Delete user
router.delete(
  ID_PARAM,
  protect,
  apiLimiter,
  deleteUserValidator,
  validateRequest,
  userController.delete
);

router.get(USER_PATH.SEARCH, protect, apiLimiter, userController.search);

router.post(
  USER_PATH.UPLOAD_AVATAR,
  protect,
  apiLimiter,
  uploadAvatar.single(CONSTANTS.AVATAR),
  userController.uploadAvatar
);

router.post(
  USER_PATH.UPLOAD_MULTIPLE,
  protect,
  checkOwner,
  apiLimiter,
  restrictTo(USER_ROLES.ADMIN),
  uploadAvatar.array(CONSTANTS.IMAGES, 10),
  userController.uploadMultipleAvatar
);

router.get(USER_PATH.GET_IMAGES, protect, apiLimiter, userController.getUserImages);
router.get(USER_PATH.GET_FILES, protect, apiLimiter, userController.getUserFiles);

router.post(USER_PATH.UPLOAD_FILE, protect, checkOwner, apiLimiter, uploadSingle, userController.uploadOneFile);
router.post(USER_PATH.UPLOAD_FILES, protect, checkOwner, apiLimiter, uploadFiles, userController.uploadManyFile);

router.delete(USER_PATH.DELETE_FILES, protect, checkOwner, apiLimiter, userController.deleteManyFiles);
router.delete(USER_PATH.DELETE_IMAGES, protect, checkOwner, apiLimiter, userController.deleteManyImages);

export default router;
