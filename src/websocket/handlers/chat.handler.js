export default function chatHandler(io, socket) {
  const RATE_LIMIT = 5; // 5 messages
  const WINDOW = 3000; // per 3 seconds
  const COOLDOWN = 10000; // 10 seconds block
  const TYPING_INTERVAL = 400;
  
  socket.msgCount = 0;
  socket.blockedUntil = 0;
  let lastTyping = 0;

  setInterval(() => {
    socket.msgCount = 0;
  }, WINDOW);

  socket.on("chat:message", (msg) => {
    if (Date.now() < socket.blockedUntil) {
      return socket.emit("error", { message: "You are temporarily blocked" });
    }

    if (!msg || typeof msg !== "string" || msg.length > 500) return;

    socket.msgCount++;

    if (socket.msgCount > RATE_LIMIT) {
      socket.blockedUntil = Date.now() + COOLDOWN;
      return socket.emit("error", {
        message: "You are sending too fast. Blocked for 10 seconds.",
      });
    }

    io.emit("chat:message", {
      id: socket.id,
      text: msg,
      time: new Date(),
    });
  });

  socket.on("typing", (data) => {
    const now = Date.now();
    if (now - lastTyping < TYPING_INTERVAL) return;
    lastTyping = now;

    io.emit("typing", {
      user: socket.id,
      ...data,
    });
  });
}
