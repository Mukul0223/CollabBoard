const boardRouter = require("express").Router();
const authenticateUser = require("../middleware/auth.js");
const {
  createBoard,
  getBoards,
  getBoardId,
  updateBoard,
  deleteBoard,
  addMember,
  removeMember,
} = require("../controllers/boardController.js");

boardRouter.use(authenticateUser);

boardRouter.post("/", createBoard);
boardRouter.get("/", getBoards);
boardRouter.get("/:id", getBoardId);
boardRouter.put("/:id", updateBoard);
boardRouter.delete("/:id", deleteBoard);

boardRouter.post("/:id/members", addMember);
boardRouter.delete("/:id/members/:userId", removeMember);

module.exports = boardRouter;
