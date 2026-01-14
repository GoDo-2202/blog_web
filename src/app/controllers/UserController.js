import User from "../models/User.js";
import AppError from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import sharp from "sharp";
import Image from "../models/Image.js";
import File from "../models/File.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createThumbnail } from "../../utils/imageProcessor.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UserController {
  index = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();
    const totalPages = Math.ceil(total / limit);
    const users = await User.find().skip(skip).limit(limit).lean();

    res.json({ success: true, page, totalPages, total, users });
  });

  post = catchAsync(async (req, res, next) => {
    const avatar = req.file ? "/uploads/" + req.file.filename : null;
    const userData = { ...req.body, avatar };

    const user = await User.create(userData);

    res.status(201).json({ success: true, user });
  });

  put = catchAsync(async (req, res, next) => {
    const avatar = req.file ? "/uploads/" + req.file.filename : undefined;
    const updateData = { ...req.body };
    if (avatar) updateData.avatar = avatar;

    const result = await User.updateOne({ _id: req.params.id }, updateData);
    if (result.matchedCount === 0) throw new AppError("User not found", 404);

    res.json({ success: true, message: "User updated successfully" });
  });

  delete = catchAsync(async (req, res, next) => {
    const result = await User.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) throw new AppError("User not found", 404);

    res.json({ success: true, message: "User deleted successfully" });
  });

  search = catchAsync(async (req, res, next) => {
    const q = req.query.q || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    if (!q)
      throw new AppError(
        'Query parameter "q" is required',
        400,
        "MISSING_QUERY"
      );

    // Tìm kiếm theo username, email, firstName, lastName, phone
    const regex = new RegExp(q, "i");

    // Đếm tổng kết quả để tính totalPages
    const total = await User.countDocuments({
      $or: [
        { username: regex },
        { email: regex },
        { firstName: regex },
        { lastName: regex },
        { phone: regex },
      ],
    });

    const totalPages = Math.ceil(total / limit);

    const users = await User.find({
      $or: [
        { username: regex },
        { email: regex },
        { firstName: regex },
        { lastName: regex },
        { phone: regex },
      ],
    })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      page,
      totalPages,
      total,
      users,
    });
  });

  getUserImages = catchAsync(async (req, res, next) => {
    const userId = req.params.id;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalImages = await Image.countDocuments({ user: userId });
    const images = await Image.find({ user: userId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      page,
      limit,
      totalImages,
      totalPages: Math.ceil(totalImages / limit),
      count: images.length,
      images,
    });
  });

  uploadAvatar = catchAsync(async (req, res, next) => {
    if (!req.file) throw new AppError("No file uploaded", 400);

    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const fullUrl = req.protocol + "://" + req.get("host");

    const rootDir = process.cwd();

    const imageDir = path.join(rootDir, "uploads", userId, "image");
    const thumbDir = path.join(rootDir, "uploads", userId, "thumb");
    fs.mkdirSync(imageDir, { recursive: true });
    fs.mkdirSync(thumbDir, { recursive: true });

    const originalFileName = req.file.filename;
    const newImagePath = path.join(imageDir, originalFileName);

    fs.renameSync(req.file.path, newImagePath);

    // Metadata ảnh gốc
    const metadata = await sharp(newImagePath).metadata();

    // Tạo thumbnail
    const thumbName = "thumb_" + originalFileName;
    const thumbPath = path.join(thumbDir, thumbName);

    const thumbResult = await createThumbnail(
      newImagePath,
      thumbPath,
      req.file.mimetype
    );

    // Convert absolute → relative
    const relativeImagePath = path
      .relative(rootDir, newImagePath)
      .replace(/\\/g, "/");
    const relativeThumbPath = path
      .relative(rootDir, thumbResult.outputPath)
      .replace(/\\/g, "/");

    const imageUrl = `${fullUrl}/${relativeImagePath}`;
    const thumbnailUrl = `${fullUrl}/${relativeThumbPath}`;

    const imageDoc = await Image.create({
      urlImage: imageUrl,
      thumbnail: thumbnailUrl,
      imageType: req.file.mimetype,
      size: req.file.size,
      width: metadata.width,
      height: metadata.height,
      user: userId,
    });

    user.avatar = imageDoc.urlImage;
    await user.save();

    res.status(201).json({
      success: true,
      image: imageDoc,
      thumbnail: {
        width: thumbResult.width,
        height: thumbResult.height,
      },
    });
  });

  uploadMultipleAvatar = catchAsync(async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      throw new AppError("No files uploaded", 400);
    }

    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const fullUrl = `${req.protocol}://${req.get("host")}`;
    const rootDir = path.join(__dirname, "../../");

    const imageDir = path.join(rootDir, "uploads", userId, "image");
    const thumbDir = path.join(rootDir, "uploads", userId, "thumb");
    fs.mkdirSync(imageDir, { recursive: true });
    fs.mkdirSync(thumbDir, { recursive: true });

    const results = [];

    for (const file of req.files) {
      const newImagePath = path.join(imageDir, file.filename);
      const thumbName = "thumb_" + file.filename;
      const thumbPath = path.join(thumbDir, thumbName);

      await fs.promises.rename(file.path, newImagePath);

      const { outputPath, newWidth, newHeight } = await createThumbnail(
        newImagePath,
        thumbPath,
        file.mimetype,
        { width: 200 }
      );

      const relativeImagePath = path
        .relative(rootDir, newImagePath)
        .replace(/\\/g, "/");
      const relativeThumbPath = path
        .relative(rootDir, outputPath)
        .replace(/\\/g, "/");

      const imageUrl = `${fullUrl}/${relativeImagePath}`;
      const thumbnailUrl = `${fullUrl}/${relativeThumbPath}`;

      const imageDoc = await Image.create({
        urlImage: imageUrl,
        thumbnail: thumbnailUrl,
        imageType: file.mimetype,
        size: file.size,
        width: newWidth,
        height: newHeight,
        user: userId,
        dateUpload: new Date(),
      });

      results.push(imageDoc);
    }

    res.status(201).json({
      success: true,
      count: results.length,
      images: results,
    });
  });

  getUserFiles = catchAsync(async (req, res, next) => {
    const userId = req.params.id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    // 👉 Lấy toàn bộ file của user (ảnh + file)
    const filter = { user: userId };

    const totalFiles = await File.countDocuments(filter);

    const files = await File.find(filter)
      .sort({ createdAt: -1 }) // mới nhất lên đầu
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      page,
      limit,
      totalFiles,
      totalPages: Math.ceil(totalFiles / limit),
      count: files.length,
      files,
    });
  });

  uploadOneFile = catchAsync(async (req, res, next) => {
    if (!req.file) throw new AppError("No file uploaded", 400);

    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const fullUrl = req.protocol + "://" + req.get("host");

    const filePath = req.file.path;
    const rootDir = process.cwd();
    const relativePath = path.relative(rootDir, filePath).replace(/\\/g, "/");

    const fileUrl = `${fullUrl}/${relativePath}`;

    let width = null;
    let height = null;

    // Nếu là ảnh → lấy metadata
    if (req.file.mimetype.startsWith("image/")) {
      try {
        const metadata = await sharp(filePath).metadata();
        width = metadata.width;
        height = metadata.height;
      } catch (_) {
        // Hỏng ảnh vẫn cho lưu, chỉ bỏ qua metadata
      }
    }

    const fileDoc = await File.create({
      fileName: req.file.originalname,
      urlFile: fileUrl,
      fileType: path.extname(req.file.originalname),
      mimeType: req.file.mimetype,
      size: req.file.size,
      width,
      height,
      thumbnail: null,
      user: userId,
    });

    res.status(201).json({
      success: true,
      file: fileDoc,
    });
  });

  uploadManyFile = catchAsync(async (req, res, next) => {
    if (!req.files || req.files.length === 0)
      throw new AppError("No files uploaded", 400);

    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const fullUrl = `${req.protocol}://${req.get("host")}`;
    const rootDir = process.cwd();

    const results = [];

    for (const file of req.files) {
      const relativePath = path
        .relative(rootDir, file.path)
        .replace(/\\/g, "/");
      const fileUrl = `${fullUrl}/${relativePath}`;

      let width = null;
      let height = null;

      if (file.mimetype.startsWith("image/")) {
        try {
          const metadata = await sharp(file.path).metadata();
          width = metadata.width;
          height = metadata.height;
        } catch (_) {}
      }

      const doc = await File.create({
        fileName: file.originalname,
        urlFile: fileUrl,
        fileType: path.extname(file.originalname),
        mimeType: file.mimetype,
        size: file.size,
        width,
        height,
        thumbnail: null,
        user: userId,
      });

      results.push(doc);
    }

    res.status(201).json({
      success: true,
      count: results.length,
      files: results,
    });
  });

  deleteManyFiles = catchAsync(async (req, res, next) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new AppError("File ids are required", 400);
    }

    // Lấy danh sách file trong DB
    const files = await File.find({ _id: { $in: ids } });

    if (files.length === 0) {
      throw new AppError("No files found", 404);
    }

    // Xoá từng file trong thư mục uploads
    for (const file of files) {
      try {
        const filePath = path.join(
          process.cwd(),
          file.urlFile.replace(/^.*\/src\//, "src/")
        );
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.log("Cannot delete file: ", err);
      }
    }

    // Xoá trong database
    await File.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      deletedCount: files.length,
      deletedIds: ids,
    });
  });

  deleteManyImages = catchAsync(async (req, res, next) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new AppError("Image ids are required", 400);
    }

    const images = await Image.find({ _id: { $in: ids } });

    if (images.length === 0) {
      throw new AppError("No images found", 404);
    }

    // path gốc của dự án (để truy cập thư mục src/uploads)
    const rootPath = path.join(__dirname, "../../../");

    for (const img of images) {
      // convert URL -> đường dẫn vật lý thật
      const localImagePath = img.urlImage.replace(/^.*\/uploads\//, "uploads/");
      const localThumbPath = img.thumbnail.replace(
        /^.*\/uploads\//,
        "uploads/"
      );

      const imagePath = path.join(
        rootPath,
        "src",
        localImagePath.replace(/^uploads\//, "uploads/")
      );
      const thumbPath = path.join(
        rootPath,
        "src",
        localThumbPath.replace(/^uploads\//, "uploads/")
      );

      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
    }

    await Image.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      deletedCount: images.length,
      deletedIds: ids,
    });
  });
}

export default new UserController();
