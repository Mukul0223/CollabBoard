const List = require("../models/list.js");
const Board = require("../models/board.js");
const Card = require("../models/card.js");
const AppError = require("../utils/AppError.js");

// --- HELPER FUNCTION ---
// Verifies if the board exists and if the user is the Owner OR a Member
const checkBoardAccess = async (boardId, userId) => {
  const board = await Board.findById(boardId);
  if (!board) {
    return { board: null, isAllowed: false };
  }

  const isOwner = board.user.toString() === userId.toString();
  const isMember = board.members.some(
    (memberId) => memberId.toString() === userId.toString(),
  );

  return { board, isAllowed: isOwner || isMember };
};

// --- CONTROLLERS ---

// POST /api/lists/board/:boardId
const createList = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { title, position } = req.body;

    if (!title) {
      return next(new AppError("List title is required", 400));
    }

    const { board, isAllowed } = await checkBoardAccess(boardId, req.user._id);

    if (!board) {
      return next(new AppError("Board not found", 404));
    }

    if (!isAllowed) {
      return next(
        new AppError(
          "Forbidden: You do not have permission to modify lists on this board",
          403,
        ),
      );
    }

    const list = new List({
      title,
      board: boardId,
      position: position !== undefined ? position : 0,
    });

    await list.save();

    res.status(201).json(list);
  } catch (error) {
    next(error);
  }
};

// GET /api/lists/board/:boardId
const getListsByBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;

    const { board, isAllowed } = await checkBoardAccess(boardId, req.user._id);

    if (!board) {
      return next(new AppError("Board not found", 404));
    }

    if (!isAllowed) {
      return next(
        new AppError(
          "Forbidden: You do not have permission to view lists on this board",
          403,
        ),
      );
    }

    // Fetch lists belonging to this board sorted by position ascending
    const lists = await List.find({ board: boardId }).sort({ position: 1 });

    res.status(200).json(lists);
  } catch (error) {
    next(error);
  }
};

// GET /api/lists/:id
const getListById = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id);

    if (!list) {
      return next(new AppError("List not found", 404));
    }

    const { isAllowed } = await checkBoardAccess(list.board, req.user._id);

    if (!isAllowed) {
      return next(
        new AppError(
          "Forbidden: You do not have permission to view this list",
          403,
        ),
      );
    }

    res.status(200).json(list);
  } catch (error) {
    next(error);
  }
};

// PUT /api/lists/:id
const updateList = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id);

    if (!list) {
      return next(new AppError("List not found", 404));
    }

    const { isAllowed } = await checkBoardAccess(list.board, req.user._id);

    if (!isAllowed) {
      return next(
        new AppError(
          "Forbidden: You do not have permission to edit this list",
          403,
        ),
      );
    }

    list.title = req.body.title || list.title;
    if (req.body.position !== undefined) {
      list.position = req.body.position;
    }

    const updatedList = await list.save();

    res.status(200).json(updatedList);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/lists/:id
const deleteList = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id);

    if (!list) {
      return next(new AppError("List not found", 404));
    }

    const { isAllowed } = await checkBoardAccess(list.board, req.user._id);

    if (!isAllowed) {
      return next(
        new AppError(
          "Forbidden: You do not have permission to delete this list",
          403,
        ),
      );
    }

    // Cascade delete: Delete all cards inside this list
    await Card.deleteMany({ list: list._id });

    // Delete the list itself
    await List.findByIdAndDelete(list._id);

    res.status(200).json({
      message: "List and all associated cards deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createList,
  getListsByBoard,
  getListById,
  updateList,
  deleteList,
};
