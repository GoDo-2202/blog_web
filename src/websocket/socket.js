import chatHandler from "../websocket/handlers/chat.handler.js";
import userHandler from "../websocket/handlers/user.handler.js";
import roomHandler from "../websocket/handlers/room.handler.js";

// socket.js
export default function setupSocketIO(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // ========================================
    // event All 
    // ========================================
    socket.onAny((event, data) => {
      console.log(`🔥 EVENT RECEIVED: ${event}`, data);
    });

    // Helper emit chuẩn hoá response
    const emitResponse = (event, data) => {
      io.emit(event, {
        id: socket.id,
        data,
        time: new Date(),
      });
    };

    // Handle event
    chatHandler(io, socket)
    userHandler(io, socket)
    roomHandler(io, socket)

    // ========================================
    // DISCONNECT
    // ========================================
    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });
}