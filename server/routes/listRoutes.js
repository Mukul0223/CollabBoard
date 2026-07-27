const listRouter = require("express").Router();
const authenticateUser = require("../middleware/auth");
const {
  createList,
  getListsByBoard,
  getListById,
  updateList,
  deleteList,
  moveList,
} = require("../controllers/listController");

listRouter.use(authenticateUser);

// Board-specific list endpoints
listRouter.post("/board/:boardId", createList);
listRouter.get("/board/:boardId", getListsByBoard);

// Individual list endpoints
listRouter.get("/:id", getListById);
listRouter.put("/:id", updateList);
listRouter.delete("/:id", deleteList);
listRouter.put("/:id/move", moveList);

module.exports = listRouter;
