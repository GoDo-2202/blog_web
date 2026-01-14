import express from "express";
import morgan from "morgan";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import methodOverride from "method-override";

import route from "./router/index.js";
import connectDB from "./config/db.js";
import * as hbsHelpers from "./app/helpers/hbsHelpers.js";
import { errorHandler } from "./app/middleware/errorHandler.js";
import AppError from "./utils/AppError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// === Middleware ===
app.use(morgan("combined"));
app.use(express.json()); // JSON body
app.use(express.urlencoded({ extended: true })); // form body
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// === Handlebars setup ===
app.engine(
  ".hbs",
  engine({
    extname: ".hbs",
    defaultLayout: false,
    helpers: hbsHelpers.helpers,
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "/resources/views"));

// === Connect DB ===
connectDB();

// === Mount Routes ===
route(app);

app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl}`, 404, "NOT_FOUND"));
});
// === Error middleware (catch async errors + AppError) ===
app.use(errorHandler);

// === Start server ===
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
