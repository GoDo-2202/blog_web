export default function roomHandler(io, socket) {
  const RATE_LIMIT = 10;       // tối đa 10 lần join/leave trong 5 giây
  const WINDOW = 5000;
  const COOLDOWN = 10000;      // bị khóa 10 giây nếu spam

  socket.roomActionCount = 0;
  socket.roomBlockedUntil = 0;

  setInterval(() => {
    socket.roomActionCount = 0;
  }, WINDOW);

  const validateRoomId = (roomId) => {
    return (
      roomId &&
      typeof roomId === "string" &&
      roomId.length > 0 &&
      roomId.length < 100
    );
  };

  socket.on("join:room", (roomId) => {
    if (Date.now() < socket.roomBlockedUntil) {
      return socket.emit("error", {
        message: "You are temporarily blocked from joining rooms.",
      });
    }

    // Validate
    if (!validateRoomId(roomId)) {
      return socket.emit("error", {
        message: "Invalid roomId.",
      });
    }

    socket.roomActionCount++;

    if (socket.roomActionCount > RATE_LIMIT) {
      socket.roomBlockedUntil = Date.now() + COOLDOWN;
      return socket.emit("error", {
        message: "Too many requests. You are temporarily blocked for 10 seconds.",
      });
    }

    console.log(`📥 User ${socket.id} joining room: ${roomId}`);
    socket.join(roomId);

    // Emit only to that room  
    io.to(roomId).emit("room:user_joined", {
      userId: socket.id,
      roomId,
    });
  });

  socket.on("leave:room", (roomId) => {
    if (Date.now() < socket.roomBlockedUntil) {
      return socket.emit("error", {
        message: "You are temporarily blocked from leaving rooms.",
      });
    }

    if (!validateRoomId(roomId)) {
      return socket.emit("error", {
        message: "Invalid roomId.",
      });
    }

    socket.roomActionCount++;

    if (socket.roomActionCount > RATE_LIMIT) {
      socket.roomBlockedUntil = Date.now() + COOLDOWN;
      return socket.emit("error", {
        message: "Too many requests. You are blocked for 10 seconds.",
      });
    }

    console.log(`📤 User ${socket.id} leaving room: ${roomId}`);
    socket.leave(roomId);

    io.to(roomId).emit("room:user_left", {
      userId: socket.id,
      roomId,
    });
  });
}
