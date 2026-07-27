const mongoose = require("mongoose");
const Card = require("../models/card.js");
const List = require("../models/list.js");
const Board = require("../models/board.js");
const AppError = require("../utils/AppError.js");

// --- HELPER FUNCTION ---
const checkListAccess = async (listId, userId) => {
  const list = await List.findById(listId);
  if (!list) return { list: null, board: null, isAllowed: false };

  const board = await Board.findById(list.board);
  if (!board) return { list, board: null, isAllowed: false };

  const isOwner = board.user.toString() === userId.toString();
  const isMember = board.members.some(
    (memberId) => memberId.toString() === userId.toString(),
  );

  return { list, board, isAllowed: isOwner || isMember };
};

// --- CONTROLLERS ---

// POST /api/cards/list/:listId
const createCard = async (req, res, next) => {
  try {
    const { listId } = req.params;
    const { title, description, position, dueDate, labels } = req.body;

    if (!title) {
      return next(new AppError("Card title is required", 400));
    }

    const { list, board, isAllowed } = await checkListAccess(
      listId,
      req.user._id,
    );

    if (!list) {
      return next(new AppError("List not found", 404));
    }

    if (!isAllowed) {
      return next(
        new AppError(
          "Forbidden: You do not have permission to add cards here",
          403,
        ),
      );
    }

    const card = new Card({
      title,
      description,
      list: listId,
      board: board._id,
      position: position !== undefined ? position : 0,
      dueDate: dueDate || null,
      labels: labels || [],
    });

    await card.save();

    res.status(201).json(card);
  } catch (error) {
    next(error);
  }
};

// GET /api/cards/list/:listId
const getCardsByList = async (req, res, next) => {
  try {
    const { listId } = req.params;

    const { list, isAllowed } = await checkListAccess(listId, req.user._id);

    if (!list) {
      return next(new AppError("List not found", 404));
    }

    if (!isAllowed) {
      return next(
        new AppError(
          "Forbidden: You do not have permission to view cards in this list",
          403,
        ),
      );
    }

    const cards = await Card.find({ list: listId }).sort({ position: 1 });

    res.status(200).json(cards);
  } catch (error) {
    next(error);
  }
};

// GET /api/cards/:id
const getCardById = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return next(new AppError("Card not found", 404));
    }

    const { isAllowed } = await checkListAccess(card.list, req.user._id);

    if (!isAllowed) {
      return next(
        new AppError(
          "Forbidden: You do not have permission to view this card",
          403,
        ),
      );
    }

    res.status(200).json(card);
  } catch (error) {
    next(error);
  }
};

// PUT /api/cards/:id
const updateCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return next(new AppError("Card not found", 404));
    }

    const { isAllowed } = await checkListAccess(card.list, req.user._id);

    if (!isAllowed) {
      return next(
        new AppError(
          "Forbidden: You do not have permission to edit this card",
          403,
        ),
      );
    }

    // Update fields
    card.title = req.body.title || card.title;
    card.description =
      req.body.description !== undefined
        ? req.body.description
        : card.description;
    if (req.body.position !== undefined) card.position = req.body.position;
    if (req.body.dueDate !== undefined) card.dueDate = req.body.dueDate;
    if (req.body.labels !== undefined) card.labels = req.body.labels;

    // Allow moving card to another list on the same board
    if (req.body.list) {
      const newListAccess = await checkListAccess(req.body.list, req.user._id);
      if (!newListAccess.list || !newListAccess.isAllowed) {
        return next(new AppError("Invalid target list", 400));
      }
      card.list = req.body.list;
    }

    const updatedCard = await card.save();

    res.status(200).json(updatedCard);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cards/:id
const deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return next(new AppError("Card not found", 404));
    }

    const { isAllowed } = await checkListAccess(card.list, req.user._id);

    if (!isAllowed) {
      return next(
        new AppError(
          "Forbidden: You do not have permission to delete this card",
          403,
        ),
      );
    }

    await Card.findByIdAndDelete(card._id);

    res.status(200).json({
      message: "Card deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/cards/:id/move
const moveCard = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cardId = req.params.id;
    const { destinationListId, destinationPosition } = req.body;

    if (!destinationListId || destinationPosition === undefined) {
      await session.abortTransaction();
      session.endSession();
      return next(
        new AppError(
          "destinationListId and destinationPosition are required",
          400,
        ),
      );
    }

    const card = await Card.findById(cardId).session(session);
    if (!card) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError("Card not found", 404));
    }

    const board = await Board.findById(card.board).session(session);
    if (!board) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError("Parent board not found", 404));
    }

    const { isAllowed } = await checkListAccess(card.list, req.user._id);
    if (!isAllowed) {
      await session.abortTransaction();
      session.endSession();
      return next(
        new AppError("Forbidden: You do not have access to this board", 403),
      );
    }

    const destinationList =
      await List.findById(destinationListId).session(session);
    if (
      !destinationList ||
      destinationList.board.toString() !== board._id.toString()
    ) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError("Invalid destination list", 400));
    }

    const sourceListId = card.list.toString();
    const isInterListMove = sourceListId !== destinationListId.toString();

    // 1. Re-index source list if inter-list move
    if (isInterListMove) {
      const sourceCards = await Card.find({
        list: sourceListId,
        _id: { $ne: card._id },
      })
        .sort({ position: 1 })
        .session(session);

      for (let i = 0; i < sourceCards.length; i++) {
        if (sourceCards[i].position !== i) {
          sourceCards[i].position = i;
          await sourceCards[i].save({ session });
        }
      }
    }

    // 2. Re-index destination list
    let destCards = await Card.find({
      list: destinationListId,
      _id: { $ne: card._id },
    })
      .sort({ position: 1 })
      .session(session);

    card.list = destinationListId;

    const targetIndex = Math.max(
      0,
      Math.min(destinationPosition, destCards.length),
    );

    destCards.splice(targetIndex, 0, card);

    for (let i = 0; i < destCards.length; i++) {
      destCards[i].position = i;
      await destCards[i].save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    const updatedCard = await Card.findById(cardId);
    res.status(200).json(updatedCard);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

module.exports = {
  createCard,
  getCardsByList,
  getCardById,
  updateCard,
  deleteCard,
  moveCard,
};
