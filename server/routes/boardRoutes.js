const boardRouter = require("express").Router();
const authenticateUser = require("../middleware/auth.js");
const {
  createBoard,
  getBoards,
  getBoardId,
  updateBoard,
  deleteBoard,
} = require("../controllers/boardController.js");

boardRouter.use(authenticateUser);

boardRouter.post("/", createBoard);
boardRouter.get("/", getBoards);
boardRouter.get("/:id", getBoardId);
boardRouter.put("/:id", updateBoard);
boardRouter.delete("/:id", deleteBoard);

module.exports = boardRouter;
