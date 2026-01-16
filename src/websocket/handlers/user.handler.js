export default function userHandler(io, socket) {
  // ====== Rate Limit Config ======
  const RATE_LIMIT = 20;       // tối đa 20 request trong 5 giây
  const WINDOW = 5000;
  const COOLDOWN = 10000;

  socket.userActionCount = 0;
  socket.userBlockedUntil = 0;

  // Reset mỗi 5 giây
  setInterval(() => {
    socket.userActionCount = 0;
  }, WINDOW);

  // ====== Validate data ======
  const validatePayload = (payload) => {
    if (!payload || typeof payload !== "object") return false;
    if (Object.keys(payload).length > 50) return false; // tránh spam object khổng lồ
    return true;
  };

  const applyRateLimit = () => {
    if (Date.now() < socket.userBlockedUntil) {
      socket.emit("error", {
        message: "User actions temporarily blocked due to spam.",
      });
      return false;
    }

    socket.userActionCount++;

    if (socket.userActionCount > RATE_LIMIT) {
      socket.userBlockedUntil = Date.now() + COOLDOWN;
      socket.emit("error", {
        message: "Too many user actions. Blocked for 10 seconds.",
      });
      return false;
    }

    return true;
  };

  // =====================================
  // DELETE USER
  // =====================================
  socket.on("delete:user", (data) => {
    if (!applyRateLimit()) return;

    if (!validatePayload(data)) {
      return socket.emit("error", { message: "Invalid delete:user payload." });
    }

    console.log("🗑️ delete:user:", data);

    io.emit("delete:user", {
      userId: socket.id,
      payload: data,
      time: new Date(),
    });
  });

  // =====================================
  // UPDATE USER
  // =====================================
  socket.on("update:user", (data) => {
    if (!applyRateLimit()) return;

    if (!validatePayload(data)) {
      return socket.emit("error", { message: "Invalid update:user payload." });
    }

    console.log("♻️ update:user:", data);

    io.emit("update:user", {
      userId: socket.id,
      payload: data,
      time: new Date(),
    });
  });
}
