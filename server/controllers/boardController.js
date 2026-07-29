const Board = require("../models/board.js");
const List = require("../models/list.js");
const Card = require("../models/card.js");
const User = require("../models/user.js");
const AppError = require("../utils/AppError.js");

// --- HELPER FUNCTIONS ---
const isBoardCollaborator = (board, userId) => {
  // Return false early if critical arguments or properties are missing
  if (!board?.user || !board?.members || !userId) return false;

  const getId = (entity) => (entity?._id ? entity._id : entity).toString();
  const targetUserId = userId.toString();

  const isOwner = getId(board.user) === targetUserId;
  const isMember =
    Array.isArray(board.members) &&
    board.members.some((member) => getId(member) === targetUserId);

  return isOwner || isMember;
};

const isBoardOwner = (board, userId) => {
  return board.user.toString() === userId.toString();
};

// --- CONTROLLERS ---

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
      members: [], // Initially empty, owner is stored in 'user'
    });
    await board.save();

    res.status(201).json(board);
  } catch (error) {
    next(error);
  }
};

// GET /api/boards (Fetch boards where user is Owner OR Member)
const getBoards = async (req, res, next) => {
  try {
    const boards = await Board.find({
      $or: [{ user: req.user._id }, { members: req.user._id }],
    });
    res.status(200).json(boards);
  } catch (error) {
    next(error);
  }
};

// GET /api/boards/:id
const getBoardId = async (req, res, next) => {
  try {
    const id = req.params.id;

    const board = await Board.findById(id).populate("members", "name email");

    if (!board) {
      return next(new AppError("Board not found", 404));
    }

    if (!isBoardCollaborator(board, req.user._id)) {
      return next(
        new AppError(
          "Forbidden: You do not have permission to access this board",
          403,
        ),
      );
    }

    // 1. Fetch lists belonging to this board sorted by position
    const lists = await List.find({ board: id }).sort({ position: 1 });

    // 2. Fetch cards belonging to all these lists sorted by position
    const listIds = lists.map((l) => l._id);
    const cards = await Card.find({ list: { $in: listIds } }).sort({
      position: 1,
    });

    // 3. Return the full board payload that the React frontend expects
    res.status(200).json({
      board,
      lists,
      cards,
    });
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

    if (!isBoardCollaborator(board, req.user._id)) {
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

    if (!isBoardOwner(board, req.user._id)) {
      return next(
        new AppError(
          "Forbidden: Only the board owner can delete this board",
          403,
        ),
      );
    }

    await Card.deleteMany({ board: board._id });
    await List.deleteMany({ board: board._id });
    await Board.findByIdAndDelete(board._id);

    // Socket.IO emission after DB deletion
    const io = req.app.get("io");
    if (io) {
      io.to(id).emit("board_deleted", { boardId: id });
    }

    res.status(200).json({
      message: "Board and all associated lists and cards deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/boards/:id/members
const addMember = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new AppError("User email is required to add a member", 400));
    }

    const board = await Board.findById(req.params.id);
    if (!board) {
      return next(new AppError("Board not found", 404));
    }

    if (!isBoardOwner(board, req.user._id)) {
      return next(
        new AppError("Forbidden: Only the owner can add members", 403),
      );
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return next(new AppError("No user found with that email address", 404));
    }

    if (board.user.toString() === userToAdd._id.toString()) {
      return next(new AppError("The owner is already on this board", 400));
    }

    const alreadyMember = board.members.some(
      (m) => m.toString() === userToAdd._id.toString(),
    );
    if (alreadyMember) {
      return next(new AppError("User is already a member of this board", 400));
    }

    board.members.push(userToAdd._id);
    await board.save();

    // Socket.IO emission after DB update
    const io = req.app.get("io");
    if (io) {
      io.to(req.params.id).emit("board_updated", { type: "MEMBER_CHANGE" });
    }

    res.status(200).json({
      message: "Member added successfully",
      board,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/boards/:id/members/:userId
const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    const board = await Board.findById(id);
    if (!board) {
      return next(new AppError("Board not found", 404));
    }

    if (!isBoardOwner(board, req.user._id)) {
      return next(
        new AppError("Forbidden: Only the owner can remove members", 403),
      );
    }

    board.members = board.members.filter(
      (memberId) => memberId.toString() !== userId,
    );

    await board.save();

    // Socket.IO emission after DB update
    const io = req.app.get("io");
    if (io) {
      io.to(id).emit("board_updated", { type: "MEMBER_CHANGE" });
    }

    res.status(200).json({
      message: "Member removed successfully",
      board,
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
  addMember,
  removeMember,
};
