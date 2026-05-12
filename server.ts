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

  // Room state to map user IDs to metadata
  const roomUsers = new Map<string, Map<string, { socketId: string, name: string, photo?: string }>>(); 

  // Signalling logic for Mesh WebRTC (Simple-Peer)
  io.on("connection", (socket) => {
    socket.on("join-room", (roomId: string, userId: string, name: string, photo?: string) => {
      console.log(`User ${name} (${userId}) joining room ${roomId}`);
      socket.join(roomId);
      
      if (!roomUsers.has(roomId)) {
        roomUsers.set(roomId, new Map());
      }
      roomUsers.get(roomId)?.set(userId, { socketId: socket.id, name, photo });

      // Tell existing users in the room that a new user joined
      // (This is useful for reactive UI even before WebRTC connects)
      socket.to(roomId).emit("user-joined-notification", { userId, name, photo });

      // Tell the new user who else is currently in the room
      const currentUsersInRoom = Array.from(roomUsers.get(roomId)!.entries())
        .filter(([id]) => id !== userId)
        .map(([id, data]) => ({ userId: id, name: data.name, photo: data.photo }));
      
      socket.emit("all-users", currentUsersInRoom);

      socket.on("sending-signal", (payload: { userToCall: string, callerId: string, signal: any }) => {
        const target = roomUsers.get(roomId)?.get(payload.userToCall);
        if (target) {
          io.to(target.socketId).emit("user-joined-signal", { 
            signal: payload.signal, 
            callerId: payload.callerId 
          });
        }
      });

      socket.on("returning-signal", (payload: { signal: any, callerId: string }) => {
        const target = roomUsers.get(roomId)?.get(payload.callerId);
        if (target) {
          io.to(target.socketId).emit("receiving-returned-signal", { 
            signal: payload.signal, 
            id: userId 
          });
        }
      });

      socket.on("toggle-media", (payload: { type: 'audio' | 'video', value: boolean, targetUserId: string, roomId: string }) => {
        socket.to(payload.roomId).emit("toggle-remote-media", payload);
      });

      socket.on("kick-user", (payload: { targetUserId: string, roomId: string }) => {
        io.to(payload.roomId).emit("user-kicked", payload);
      });
      
      socket.on("speaking", (payload: { userId: string, roomId: string, isSpeaking: boolean }) => {
        socket.to(payload.roomId).emit("user-speaking", payload);
      });

      socket.on("disconnect", () => {
        console.log(`User ${userId} disconnected`);
        roomUsers.get(roomId)?.delete(userId);
        if (roomUsers.get(roomId)?.size === 0) {
          roomUsers.delete(roomId);
        }
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
