const cardRouter = require("express").Router();
const authenticateUser = require("../middleware/auth");
const {
  createCard,
  getCardsByList,
  getCardById,
  updateCard,
  deleteCard,
} = require("../controllers/cardController");

cardRouter.use(authenticateUser);

// List-specific card routes
cardRouter.post("/list/:listId", createCard);
cardRouter.get("/list/:listId", getCardsByList);

// Individual card routes
cardRouter.get("/:id", getCardById);
cardRouter.put("/:id", updateCard);
cardRouter.delete("/:id", deleteCard);

module.exports = cardRouter;
