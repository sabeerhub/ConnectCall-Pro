import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Room state to map user IDs to socket IDs
  const roomUsers = new Map<string, Map<string, string>>(); // roomId -> (userId -> socketId)

  // Signalling logic for Mesh WebRTC (Simple-Peer)
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (roomId: string, userId: string) => {
      console.log(`User ${userId} (Socket: ${socket.id}) joining room ${roomId}`);
      socket.join(roomId);
      
      if (!roomUsers.has(roomId)) {
        roomUsers.set(roomId, new Map());
      }
      roomUsers.get(roomId)?.set(userId, socket.id);

      // Tell the new user who else is in the room
      const otherUsers = Array.from(roomUsers.get(roomId)?.keys() || []).filter(id => id !== userId);
      socket.emit("all-users", otherUsers);

      socket.on("sending-signal", (payload: { userToCall: string, callerId: string, signal: any }) => {
        const targetSocketId = roomUsers.get(roomId)?.get(payload.userToCall);
        if (targetSocketId) {
          io.to(targetSocketId).emit("user-joined-signal", { 
            signal: payload.signal, 
            callerId: payload.callerId 
          });
        }
      });

      socket.on("returning-signal", (payload: { signal: any, callerId: string }) => {
        const targetSocketId = roomUsers.get(roomId)?.get(payload.callerId);
        if (targetSocketId) {
          io.to(targetSocketId).emit("receiving-returned-signal", { 
            signal: payload.signal, 
            id: userId // Use the sender's userId
          });
        }
      });

      socket.on("toggle-media", (payload: { type: 'audio' | 'video', value: boolean, targetUserId: string, roomId: string }) => {
        io.to(payload.roomId).emit("toggle-remote-media", payload);
      });

      socket.on("kick-user", (payload: { targetUserId: string, roomId: string }) => {
        io.to(payload.roomId).emit("user-kicked", payload);
      });

      socket.on("disconnect", () => {
        console.log(`User ${userId} disconnected`);
        roomUsers.get(roomId)?.delete(userId);
        socket.to(roomId).emit("user-disconnected", userId);
      });
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
