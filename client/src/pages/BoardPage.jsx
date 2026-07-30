import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import {
  getBoardByIdApi,
  createListApi,
  createCardApi,
  updateCardApi,
  deleteBoardApi,
  deleteListApi,
  deleteCardApi,
  addMemberApi,
  removeMemberApi,
} from "../services/boardService";
import { useBoardStore } from "../store/boardStore";
import { useAuthStore } from "../store/authStore";
import { socket } from "../services/socket";

import BoardHeader from "../components/BoardHeader";
import List from "../components/List";
import Modal from "../components/Modal";
import CardDetailModal from "../components/CardDetailModal";

const BoardPage = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  const {
    currentBoard,
    setCurrentBoard,
    lists,
    setLists,
    cards,
    setCards,
    isLoading,
    setLoading,
    error,
    setError,
  } = useBoardStore();

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberError, setMemberError] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  // Card Modal State
  const [selectedCard, setSelectedCard] = useState(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  // Fetch Board Details
  const fetchBoardDetails = useCallback(
    async (silent = false) => {
      if (!boardId || boardId === "undefined") return;
      try {
        if (!silent) setLoading(true);
        setError(null);
        const data = await getBoardByIdApi(boardId);

        setCurrentBoard(data.board);
        setLists(data.lists || []);

        const cardsMap = {};
        (data.lists || []).forEach((l) => {
          cardsMap[l.id || l._id] = [];
        });

        (data.cards || []).forEach((c) => {
          const listId =
            typeof c.list === "object" ? c.list.id || c.list._id : c.list;
          if (!cardsMap[listId]) cardsMap[listId] = [];
          cardsMap[listId].push(c);
        });

        setCards(cardsMap);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load board details");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [boardId, setCurrentBoard, setLists, setCards, setLoading, setError],
  );

  // Real-Time Socket Listeners (Includes Granular Listeners)
  useEffect(() => {
    fetchBoardDetails();

    if (!socket || !boardId) return;

    socket.emit("join_board", boardId);

    // Refresh handlers for incoming granular socket events
    const handleSync = () => fetchBoardDetails(true);
    const handleBoardDeleted = () => {
      alert("This board was deleted by the owner.");
      navigate("/dashboard");
    };

    // Listen to generic + granular event triggers
    socket.on("board_updated", handleSync);
    socket.on("card_created", handleSync);
    socket.on("card_moved", handleSync);
    socket.on("card_deleted", handleSync);
    socket.on("list_created", handleSync);
    socket.on("list_moved", handleSync);
    socket.on("list_deleted", handleSync);
    socket.on("board_deleted", handleBoardDeleted);

    return () => {
      socket.emit("leave_board", boardId);
      socket.off("board_updated", handleSync);
      socket.off("card_created", handleSync);
      socket.off("card_moved", handleSync);
      socket.off("card_deleted", handleSync);
      socket.off("list_created", handleSync);
      socket.off("list_moved", handleSync);
      socket.off("list_deleted", handleSync);
      socket.off("board_deleted", handleBoardDeleted);
    };
  }, [boardId, fetchBoardDetails, navigate]);

  // Handle Drag & Drop with API Persistence
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    // Handle List Reordering
    if (type === "COLUMN") {
      const reorderedLists = Array.from(lists);
      const [moved] = reorderedLists.splice(source.index, 1);
      reorderedLists.splice(destination.index, 0, moved);

      setLists(reorderedLists);
      socket.emit("move_list", { boardId, listId: draggableId });
      return;
    }

    // Handle Card Reordering
    const sourceListId = source.droppableId;
    const destListId = destination.droppableId;

    const sourceCards = Array.from(cards[sourceListId] || []);
    const destCards =
      sourceListId === destListId
        ? sourceCards
        : Array.from(cards[destListId] || []);

    const [movedCard] = sourceCards.splice(source.index, 1);
    const updatedCard = { ...movedCard, list: destListId };

    destCards.splice(destination.index, 0, updatedCard);

    // 1. Optimistic UI update
    setCards({
      ...cards,
      [sourceListId]: sourceCards,
      [destListId]: destCards,
    });

    // 2. Broadcast specific live socket move
    socket.emit("move_card", { boardId, cardId: draggableId });

    // 3. Persist to database
    try {
      await updateCardApi(draggableId, {
        list: destListId,
        position: destination.index,
      });
    } catch (err) {
      console.error("Failed to persist card position:", err);
      fetchBoardDetails(true);
    }
  };

  // Card Handlers
  const handleCardClick = (card) => {
    setSelectedCard(card);
    setIsCardModalOpen(true);
  };

  const handleUpdateCardDetails = async (cardId, updatedFields) => {
    try {
      await updateCardApi(cardId, updatedFields);
      await fetchBoardDetails(true);
      socket.emit("board_updated", { boardId });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update card");
    }
  };

  const handleAddCard = async (listId, cardTitle) => {
    try {
      const currentListCards = cards[listId] || [];
      const newCard = await createCardApi(listId, {
        title: cardTitle,
        position: currentListCards.length,
      });
      setCards({ ...cards, [listId]: [...currentListCards, newCard] });
      socket.emit("create_card", { boardId, card: newCard });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create card");
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await deleteCardApi(cardId);
      await fetchBoardDetails(true);
      socket.emit("delete_card", { boardId, cardId });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete card");
    }
  };

  // List & Member Handlers
  const handleDeleteBoard = async () => {
    if (!window.confirm("Delete this board?")) return;
    try {
      await deleteBoardApi(boardId);
      socket.emit("board_deleted", { boardId });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete board");
    }
  };

  const handleAddListSubmit = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    try {
      const newList = await createListApi(boardId, {
        title: newListTitle.trim(),
        position: lists.length,
      });
      setLists([...lists, newList]);
      setCards({ ...cards, [newList.id || newList._id]: [] });
      setNewListTitle("");
      setIsAddingList(false);
      socket.emit("create_list", { boardId, list: newList });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create list");
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm("Delete this list?")) return;
    try {
      await deleteListApi(listId);
      setLists(lists.filter((l) => (l.id || l._id) !== listId));
      socket.emit("delete_list", { boardId, listId });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete list");
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;
    try {
      setAddingMember(true);
      await addMemberApi(boardId, memberEmail.trim());
      fetchBoardDetails(true);
      setMemberEmail("");
      setIsMemberModalOpen(false);
      socket.emit("board_updated", { boardId });
    } catch (err) {
      setMemberError(err.response?.data?.message || "Failed to add member");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove member?")) return;
    try {
      await removeMemberApi(boardId, userId);
      fetchBoardDetails(true);
      socket.emit("board_updated", { boardId });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove member");
    }
  };

  const currentUserId = currentUser?.id || currentUser?._id;
  const boardOwnerId =
    typeof currentBoard?.user === "object"
      ? currentBoard?.user?.id || currentBoard?.user?._id
      : currentBoard?.user;
  const isOwner = Boolean(
    currentUserId &&
    boardOwnerId &&
    currentUserId.toString() === boardOwnerId.toString(),
  );

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
        Loading board...
      </div>
    );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <BoardHeader
        currentBoard={currentBoard}
        isOwner={isOwner}
        currentUserId={currentUserId}
        onInviteClick={() => setIsMemberModalOpen(true)}
        onDeleteBoard={handleDeleteBoard}
        onRemoveMember={handleRemoveMember}
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200 flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-xs text-red-500 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Drag & Drop Kanban Area */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable
          droppableId="all-columns"
          direction="horizontal"
          type="COLUMN"
        >
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex-1 flex items-start space-x-4 overflow-x-auto pb-4"
            >
              {lists.map((list, index) => {
                const listId = list.id || list._id;
                return (
                  <List
                    key={listId}
                    list={list}
                    index={index}
                    cards={cards[listId] || []}
                    onAddCard={handleAddCard}
                    onDeleteCard={handleDeleteCard}
                    onDeleteList={handleDeleteList}
                    onCardClick={handleCardClick}
                  />
                );
              })}
              {provided.placeholder}

              {/* Add List Form */}
              <div className="w-72 shrink-0">
                {isAddingList ? (
                  <form
                    onSubmit={handleAddListSubmit}
                    className="bg-gray-100 p-3 rounded-lg border border-gray-200 space-y-2"
                  >
                    <input
                      type="text"
                      placeholder="Enter list title..."
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      autoFocus
                      className="w-full text-sm p-2 border border-indigo-400 rounded bg-white focus:outline-none"
                    />
                    <div className="flex items-center space-x-2">
                      <button
                        type="submit"
                        className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded font-medium"
                      >
                        Add List
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingList(false)}
                        className="text-xs text-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsAddingList(true)}
                    className="w-full bg-gray-200/70 hover:bg-gray-200 text-gray-700 font-medium p-3 rounded-lg text-sm text-left"
                  >
                    + Add another list
                  </button>
                )}
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Card Detail Modal */}
      <CardDetailModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        card={selectedCard}
        onUpdateCard={handleUpdateCardDetails}
        onDeleteCard={handleDeleteCard}
      />

      {/* Invite Member Modal */}
      <Modal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        title="Invite Member to Board"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          {memberError && (
            <div className="p-2 bg-red-50 text-red-600 text-xs rounded border border-red-200">
              {memberError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Email Address
            </label>
            <input
              type="email"
              required
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsMemberModalOpen(false)}
              className="px-3 py-1.5 text-xs text-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addingMember}
              className="bg-indigo-600 text-white text-xs px-4 py-1.5 rounded font-medium disabled:opacity-50"
            >
              {addingMember ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BoardPage;
