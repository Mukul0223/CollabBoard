import { useEffect, useState } from "react";
import { getBoardsApi, createBoardApi } from "../services/boardService";
import { useBoardStore } from "../store/boardStore";
import BoardCard from "../components/BoardCard";
import Modal from "../components/Modal";

const DashboardPage = () => {
  const { boards, setBoards } = useBoardStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // Fetch boards on component mount
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        setLoading(true);
        const data = await getBoardsApi();
        setBoards(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load boards");
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, [setBoards]);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setCreating(true);
      const newBoard = await createBoardApi({ title, description });
      setBoards([...boards, newBoard]);
      setTitle("");
      setDescription("");
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create board");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Boards</h1>
          <p className="text-sm text-gray-500">
            Select a board to manage tasks or create a new one.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-md text-sm transition-colors cursor-pointer"
        >
          + Create New Board
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
          {error}
        </div>
      )}

      {/* Boards Grid View */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          Loading your boards...
        </div>
      ) : boards.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 text-sm">No boards found.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-3 text-indigo-600 hover:underline text-sm font-medium cursor-pointer"
          >
            Create your first board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
      )}

      {/* Create Board Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Board"
      >
        <form onSubmit={handleCreateBoard} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Board Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Project Roadmap"
              className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of this board..."
              className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="bg-indigo-600 text-white text-xs px-4 py-1.5 rounded hover:bg-indigo-700 font-medium disabled:opacity-90 cursor-pointer"
            >
              {creating ? "Creating..." : "Create Board"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DashboardPage;
