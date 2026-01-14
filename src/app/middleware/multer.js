import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.params.id;
    if (!userId) return cb(new Error("Missing userId in URL"));

    // Phân loại folder theo fieldname người gửi
    let subFolder = "file"; // default

    switch (file.fieldname) {
      case "avatar":
        subFolder = "avatar";
        break;
      case "image":
        subFolder = "image";
        break;
      case "file":
      case "files":
        subFolder = "file";
        break;
      default:
        subFolder = "file"; // fallback
    }

    const uploadPath = path.join(
      __dirname,
      `../../uploads/${userId}/${subFolder}`
    );

    // Tạo folder nếu chưa tồn tại
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName =
      crypto.randomBytes(16).toString("hex") + "_" + Date.now() + ext;
    cb(null, uniqueName);
  },
});

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [".png", ".jpg", ".jpeg"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error("Only images are allowed"));
    }
    cb(null, true);
  },
});

export const uploadSingle = multer({
  storage,
}).single("file");
export const uploadFiles = multer({
  storage,
}).array("files", 20);
