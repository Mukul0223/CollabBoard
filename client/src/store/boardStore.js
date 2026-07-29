import { create } from "zustand";

export const useBoardStore = create((set, get) => ({
  // --- STATE ---
  boards: [],
  currentBoard: null,
  lists: [], // Array of list objects for active board
  cards: {}, // Map of listId -> Array of card objects
  isLoading: false,
  error: null,

  // --- BASIC SETTERS ---
  setBoards: (boards) => set({ boards }),
  setCurrentBoard: (currentBoard) => set({ currentBoard }),
  setLists: (lists) => set({ lists }),
  setCards: (cards) => set({ cards }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // --- OPTIMISTIC UPDATE ACTIONS ---

  /**
   * Optimistically reorders lists on the current board.
   * Pattern: Save Snapshot -> Apply Change -> API Request -> Rollback on Error
   */
  moveListOptimistic: async (listId, destinationPosition, apiCallFn) => {
    // 1. Snapshot previous state
    const previousLists = [...get().lists];

    // Calculate new position array locally
    const currentLists = [...previousLists];
    const listToMove = currentLists.find((l) => l.id === listId);
    if (!listToMove) return;

    const filteredLists = currentLists.filter((l) => l.id !== listId);
    filteredLists.splice(destinationPosition, 0, listToMove);

    // Re-index position fields
    const updatedLists = filteredLists.map((list, index) => ({
      ...list,
      position: index,
    }));

    // Apply change locally immediately
    set({ lists: updatedLists, error: null });

    // 2. Fire background request
    try {
      if (apiCallFn) {
        await apiCallFn(listId, destinationPosition);
      }
    } catch (err) {
      // 3. Rollback on failure
      console.error("Failed to persist list move:", err);
      set({
        lists: previousLists,
        error: "Failed to move list. Reverting changes.",
      });
    }
  },

  /**
   * Optimistically moves a card within or between lists.
   */
  moveCardOptimistic: async (
    cardId,
    sourceListId,
    targetListId,
    destinationIndex,
    apiCallFn,
  ) => {
    // 1. Snapshot current cards state
    const previousCards = JSON.parse(JSON.stringify(get().cards));

    const updatedCards = { ...get().cards };
    const sourceCards = [...(updatedCards[sourceListId] || [])];
    const targetCards =
      sourceListId === targetListId
        ? sourceCards
        : [...(updatedCards[targetListId] || [])];

    // Find and remove dragged card
    const cardIndex = sourceCards.findIndex((c) => c.id === cardId);
    if (cardIndex === -1) return;

    const [movedCard] = sourceCards.splice(cardIndex, 1);
    movedCard.list = targetListId;

    // Insert into destination list
    targetCards.splice(destinationIndex, 0, movedCard);

    // Update state object
    updatedCards[sourceListId] = sourceCards.map((c, i) => ({
      ...c,
      position: i,
    }));
    updatedCards[targetListId] = targetCards.map((c, i) => ({
      ...c,
      position: i,
    }));

    // Apply change locally
    set({ cards: updatedCards, error: null });

    // 2. Fire background API request
    try {
      if (apiCallFn) {
        await apiCallFn(cardId, targetListId, destinationIndex);
      }
    } catch (err) {
      // 3. Rollback on failure
      console.error("Failed to persist card move:", err);
      set({
        cards: previousCards,
        error: "Failed to move card. Reverting changes.",
      });
    }
  },
}));
