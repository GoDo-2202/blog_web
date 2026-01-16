import "dotenv/config"; // Load .env cho toàn bộ tiến trình
import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folder migrations tuyệt đối
const migrationDir = path.join(__dirname);

// Lấy các file dạng 001_xxx.js, 002_xxx.js
const files = fs
  .readdirSync(migrationDir)
  .filter((f) => /^\d+.*\.js$/.test(f))
  .sort();

console.log("Migration files:", files);

for (const file of files) {
  const fullPath = path.join(migrationDir, file);

  console.log(`\n>>> Running migration: ${file}`);

  // Quan trọng nhất: truyền ENV trực tiếp vào execSync
  execSync(`node ${fullPath}`, {
    stdio: "inherit",
    env: {
      ...process.env, // truyền toàn bộ env hiện tại
    },
  });
}

console.log("\nAll migrations completed!");
