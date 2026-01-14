// src/utils/imageProcessor.js
import sharp from "sharp";

export async function createThumbnail(inputPath, outputPath, mimeType, options = {}) {
  const { width = null } = options; // 👉 width optional

  let processor = sharp(inputPath);

  // 👉 Nếu có truyền width thì mới resize
  if (width) {
    processor = processor.resize({
      width,
      withoutEnlargement: true,
    });
  }

  // 👉 Lấy metadata (độ phân giải mới)
  let metadata = await sharp(inputPath).metadata();

  switch (mimeType) {
    case "image/jpeg":
    case "image/jpg":
      processor = processor.jpeg({ quality: 60 });
      break;

    case "image/png":
      processor = processor.png({ compressionLevel: 9 });
      break;

    case "image/webp":
      processor = processor.webp({ quality: 60 });
      break;

    case "image/gif":
      processor = processor.gif({ reoptimise: true });
      break;

    default:
      processor = processor.webp({ quality: 60 });
      outputPath = outputPath.replace(/\.\w+$/, ".webp");
  }

  await processor.toFile(outputPath);

  // 👉 Lấy metadata của file thumbnail sau khi xử lý
  const thumbMeta = await sharp(outputPath).metadata();

  return {
    outputPath,
    newWidth: thumbMeta.width || metadata.width,
    newHeight: thumbMeta.height || metadata.height,
  };
}