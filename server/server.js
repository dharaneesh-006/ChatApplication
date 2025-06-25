import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/mesageRoutes.js";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

// Socket.io setup
export const io = new Server(server, {
  cors: { origin: "*" } // You can replace * with process.env.CLIENT_URL later
});

export const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("✅ User Connected:", userId);

  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("❌ User Disconnected:", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Middlewares
app.use(express.json({ limit: "4mb" }));
app.use(cors()); // Or use cors({ origin: process.env.CLIENT_URL, credentials: true })

// Routes
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// DB connection and start server
await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("✅ Server is running on PORT:", PORT);
});

export default server;
