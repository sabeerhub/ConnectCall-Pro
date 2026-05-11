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

  // Signalling logic for Mesh WebRTC (Simple-Peer)
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (roomId: string, userId: string) => {
      console.log(`User ${userId} (Socket: ${socket.id}) joining room ${roomId}`);
      socket.join(roomId);
      
      // Let others in the room know someone new joined
      socket.to(roomId).emit("user-connected", userId);

      socket.on("sending-signal", (payload: { userToCall: string, callerId: string, signal: any }) => {
        io.to(roomId).emit("user-joined-signal", { signal: payload.signal, callerId: payload.callerId });
      });

      socket.on("returning-signal", (payload: { signal: any, callerId: string }) => {
        io.to(roomId).emit("receiving-returned-signal", { signal: payload.signal, id: socket.id });
      });

      socket.on("toggle-media", (payload: { type: 'audio' | 'video', value: boolean, targetUserId: string, roomId: string }) => {
        io.to(payload.roomId).emit("toggle-remote-media", payload);
      });

      socket.on("kick-user", (payload: { targetUserId: string, roomId: string }) => {
        io.to(payload.roomId).emit("user-kicked", payload);
      });

      socket.on("disconnect", () => {
        console.log(`User ${userId} disconnected`);
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
