import { useState } from "react";
import { useParams } from "react-router-dom";
import List from "../components/List";

const BoardPage = () => {
  const { boardId } = useParams();

  // Mock data for Milestone 8 UI layout testing
  const [lists, setLists] = useState([
    { _id: "l1", title: "To Do" },
    { _id: "l2", title: "In Progress" },
  ]);

  const [cards, setCards] = useState({
    l1: [
      { _id: "c1", title: "Design database schemas", labels: ["Backend"] },
      { _id: "c2", title: "Build UI components", dueDate: "2026-08-01" },
    ],
    l2: [{ _id: "c3", title: "Setup Vite & Tailwind" }],
  });

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  const handleAddListSubmit = (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    const newListId = `l_${Date.now()}`;
    setLists([...lists, { _id: newListId, title: newListTitle.trim() }]);
    setCards({ ...cards, [newListId]: [] });
    setNewListTitle("");
    setIsAddingList(false);
  };

  const handleAddCard = (listId, cardTitle) => {
    const newCard = { _id: `c_${Date.now()}`, title: cardTitle };
    setCards({
      ...cards,
      [listId]: [...(cards[listId] || []), newCard],
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Board Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Board Preview ({boardId})
        </h1>
      </div>

      {/* Kanban Board Horizontal Canvas */}
      <div className="flex-1 flex items-start space-x-4 overflow-x-auto pb-4">
        {lists.map((list) => (
          <List
            key={list._id}
            list={list}
            cards={cards[list._id] || []}
            onAddCard={handleAddCard}
            onCardClick={(card) => console.log("Card clicked:", card)}
          />
        ))}

        {/* Add List Controls */}
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
                className="w-full text-sm p-2 border border-indigo-400 rounded focus:outline-none bg-white"
              />
              <div className="flex items-center space-x-2">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded hover:bg-indigo-700 font-medium cursor-pointer"
                >
                  Add List
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingList(false)}
                  className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingList(true)}
              className="w-full bg-gray-200/70 hover:bg-gray-200 text-gray-700 font-medium p-3 rounded-lg text-sm text-left transition-colors cursor-pointer"
            >
              + Add another list
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardPage;
