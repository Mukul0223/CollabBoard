const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const env = require("./config/env");
const configureCors = require("./config/cors");
const { corsOptions } = require("./config/cors"); // Import corsOptions
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

// 2. Configure CORS middleware first before setting up Socket.IO
configureCors(app);

// 3. Initialize Socket.IO with shared dynamic CORS options
const io = new Server(server, {
  cors: corsOptions,
});

// 4. Attach socket.io instance
app.set("io", io);

// 5. Socket connection listeners
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // --- Board Room Management ---
  socket.on("join_board", (boardId) => {
    socket.join(boardId);
    console.log(`Socket ${socket.id} joined board room: ${boardId}`);
  });

  socket.on("leave_board", (boardId) => {
    socket.leave(boardId);
    console.log(`Socket ${socket.id} left board room: ${boardId}`);
  });

  // --- Board Events ---
  socket.on("board_updated", (data) => {
    socket.to(data.boardId).emit("board_updated", data);
  });

  socket.on("board_deleted", (data) => {
    socket.to(data.boardId).emit("board_deleted", data);
  });

  // --- List CRUD Events ---
  socket.on("create_list", (data) => {
    socket.to(data.boardId).emit("list_created", data);
  });

  socket.on("move_list", (data) => {
    socket.to(data.boardId).emit("list_moved", data);
  });

  socket.on("delete_list", (data) => {
    socket.to(data.boardId).emit("delete_list", data);
  });

  // --- Card CRUD Events ---
  socket.on("create_card", (data) => {
    socket.to(data.boardId).emit("card_created", data);
  });

  socket.on("move_card", (data) => {
    socket.to(data.boardId).emit("card_moved", data);
  });

  socket.on("delete_card", (data) => {
    socket.to(data.boardId).emit("card_deleted", data);
  });

  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

// Global Middlewares
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
