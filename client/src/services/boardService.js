import API from "./api";

// --- BOARDS ---
export const getBoardsApi = async () => {
  const response = await API.get("/boards");
  return response.data;
};

export const getBoardByIdApi = async (boardId) => {
  const response = await API.get(`/boards/${boardId}`);
  return response.data;
};

export const createBoardApi = async (boardData) => {
  const response = await API.post("/boards", boardData);
  return response.data;
};

// Delete Board
export const deleteBoardApi = async (boardId) => {
  const response = await API.delete(`/boards/${boardId}`);
  return response.data;
};

// --- LISTS ---
export const createListApi = async (boardId, listData) => {
  // Matches listRouter.post("/board/:boardId", createList)
  const response = await API.post(`/lists/board/${boardId}`, listData);
  return response.data;
};

export const getListsByBoardApi = async (boardId) => {
  // Matches listRouter.get("/board/:boardId", getListsByBoard)
  const response = await API.get(`/lists/board/${boardId}`);
  return response.data;
};

export const moveListApi = async (listId, position) => {
  const response = await API.patch(`/lists/${listId}/move`, { position });
  return response.data;
};

// Delete List
export const deleteListApi = async (listId) => {
  const response = await API.delete(`/lists/${listId}`);
  return response.data;
};

// --- CARDS ---
export const createCardApi = async (listId, cardData) => {
  // Matches card creation endpoint (assuming /api/cards/list/:listId or /api/cards)
  const response = await API.post(`/cards/list/${listId}`, cardData);
  return response.data;
};

export const moveCardApi = async (cardId, targetListId, position) => {
  const response = await API.patch(`/cards/${cardId}/move`, {
    targetListId,
    position,
  });
  return response.data;
};

export const updateCardApi = async (cardId, cardData) => {
  const response = await API.put(`/cards/${cardId}`, cardData);
  return response.data;
};

// Delete Card
export const deleteCardApi = async (cardId) => {
  const response = await API.delete(`/cards/${cardId}`);
  return response.data;
};

export const addMemberApi = async (boardId, email) => {
  const response = await API.post(`/boards/${boardId}/members`, { email });
  return response.data;
};

export const removeMemberApi = async (boardId, userId) => {
  const response = await API.delete(`/boards/${boardId}/members/${userId}`);
  return response.data;
};
