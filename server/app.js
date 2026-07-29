const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const configureCors = require("./config/cors");
const logger = require("./middleware/logger");
const unknownEndpoint = require("./middleware/unknownEndpoint");
const errorHandler = require("./middleware/errorHandler");

const healthRouter = require("./routes/health");
const authRouter = require("./routes/authRoutes");
const boardRouter = require("./routes/boardRoutes.js");
const listRouter = require("./routes/listRoutes.js");
const cardRouter = require("./routes/cardRoutes.js");

const app = express();

// 1. Create HTTP server from express app
const server = http.createServer(app);

// 2. Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// 3. Attach socket.io instance so routes/controllers can access req.app.get("io")
app.set("io", io);

// 4. Socket connection listeners
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Board room management
  socket.on("join_board", (boardId) => {
    socket.join(boardId);
    console.log(`Socket ${socket.id} joined board room: ${boardId}`);
  });

  socket.on("leave_board", (boardId) => {
    socket.leave(boardId);
    console.log(`Socket ${socket.id} left board room: ${boardId}`);
  });

  // --- ADDED: Drag-and-Drop Real-time Broadcasts ---
  socket.on("move_card", (data) => {
    // Relay to all subscribers in this room EXCEPT the sender
    socket.to(data.boardId).emit("card_moved", data);
  });

  socket.on("move_list", (data) => {
    // Relay to all subscribers in this room EXCEPT the sender
    socket.to(data.boardId).emit("list_moved", data);
  });

  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

// Global Middlewares
configureCors(app);
app.use(logger);
app.use(express.json());

// Base Routes
app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/boards", boardRouter);
app.use("/api/lists", listRouter);
app.use("/api/cards", cardRouter);

// Error Handling
app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = { app, server };
