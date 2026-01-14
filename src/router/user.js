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

const router = express.Router();

router.get("/", paginationValidator, validateRequest, userController.index);

router.post(
  "/",
  uploadAvatar.single("avatar"),
  createUserValidator,
  validateRequest,
  userController.post
);

// Update user
router.put("/:id", updateUserValidator, validateRequest, userController.put);

// Delete user
router.delete(
  "/:id",
  deleteUserValidator,
  validateRequest,
  userController.delete
);

router.get("/search", userController.search);

router.post(
  "/:id/upload-avatar",
  uploadAvatar.single("avatar"),
  userController.uploadAvatar
);

router.post(
  "/:id/upload-multiple",
  uploadAvatar.array("images", 10),
  userController.uploadMultipleAvatar
);

router.get("/:id/images", userController.getUserImages);
router.get("/:id/files", userController.getUserFiles);

router.post("/:id/upload-file", uploadSingle, userController.uploadOneFile);
router.post("/:id/upload-files", uploadFiles, userController.uploadManyFile);

router.delete("/:id/delete-files", userController.deleteManyFiles);
router.delete("/:id/delete-images", userController.deleteManyImages);

export default router;
