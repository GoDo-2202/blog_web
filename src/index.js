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
import dotenv from "dotenv";

// Thêm WebSocket
import http from "http";
import { Server } from "socket.io";
import setupSocketIO from "../src/websocket/socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const server = http.createServer(app); 
const io = new Server(server, {
  cors: { origin: "*" },
});

// Gọi file socket.js
setupSocketIO(io);

const port = 3000;

// ==== Middleware ====
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ==== Handlebars ====
app.engine(".hbs", engine({ extname: ".hbs", helpers: hbsHelpers.helpers }));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "/resources/views"));

// ==== DB + Routes ====
connectDB();
route(app);

// ==== Error ====
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl}`, 404, "NOT_FOUND"));
});
app.use(errorHandler);

console.log("MONGO URI:", process.env.MONGO_URI);

// ==== Start server ====
server.listen(port, () => {
  console.log(`Server + WebSocket running at http://localhost:${port}`);
});