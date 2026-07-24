const Board = require("../models/board.js");
const List = require("../models/list.js");
const Card = require("../models/card.js");
const AppError = require("../utils/AppError.js");

// POST /api/boards
const createBoard = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return next(new AppError("Board title is required", 400));
    }

    const board = new Board({
      title,
      description,
      user: req.user._id,
    });
    await board.save();

    res.status(201).json(board);
  } catch (error) {
    next(error);
  }
};

// GET /api/boards
const getBoards = async (req, res, next) => {
  try {
    const boards = await Board.find({ user: req.user._id });
    res.status(200).json(boards);
  } catch (error) {
    next(error);
  }
};

// GET /api/boards/:id
const getBoardId = async (req, res, next) => {
  try {
    const id = req.params.id;
    const board = await Board.findById(id);

    if (!board) {
      return next(new AppError("Board not found", 404));
    }

    if (board.user.toString() !== req.user._id.toString()) {
      return next(
        new AppError(
          "Forbidden: You do not have permission to access this board",
          403,
        ),
      );
    }

    res.status(200).json(board);
  } catch (error) {
    next(error);
  }
};

// PUT /api/boards/:id
const updateBoard = async (req, res, next) => {
  try {
    const id = req.params.id;
    const board = await Board.findById(id);

    if (!board) {
      return next(new AppError("Board not found", 404));
    }

    if (board.user.toString() !== req.user._id.toString()) {
      return next(
        new AppError(
          "Forbidden: You do not have permission to access this board",
          403,
        ),
      );
    }

    board.title = req.body.title || board.title;
    board.description = req.body.description || board.description;

    const updatedBoard = await board.save();

    res.status(200).json(updatedBoard);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/boards/:id
const deleteBoard = async (req, res, next) => {
  try {
    const id = req.params.id;
    const board = await Board.findById(id);

    if (!board) {
      return next(new AppError("Board not found", 404));
    }

    if (board.user.toString() !== req.user._id.toString()) {
      return next(
        new AppError(
          "Forbidden: You do not have permission to access this board",
          403,
        ),
      );
    }

    await Card.deleteMany({ board: board._id });
    await List.deleteMany({ board: board._id });
    await Board.findByIdAndDelete(board._id);

    res.status(200).json({
      message: "Board and all associated lists and cards deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBoard,
  getBoards,
  getBoardId,
  updateBoard,
  deleteBoard,
};
