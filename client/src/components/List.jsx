import { useState } from "react";
import Card from "./Card";

const List = ({ list, cards = [], onAddCard, onCardClick }) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");

  const handleAddCardSubmit = (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    if (onAddCard) {
      onAddCard(list._id, newCardTitle.trim());
    }
    setNewCardTitle("");
    setIsAddingCard(false);
  };

  return (
    <div className="bg-gray-100 rounded-lg p-3 w-72 shrink-0 flex flex-col max-h-full border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="font-semibold text-gray-700 text-sm truncate">
          {list.title}
        </h2>
        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
          {cards.length}
        </span>
      </div>

      {/* Cards Scroll Container */}
      <div className="flex-1 overflow-y-auto px-0.5 min-h-12.5">
        {cards.map((card) => (
          <Card key={card._id} card={card} onClick={onCardClick} />
        ))}
      </div>

      {/* Add Card Control */}
      <div className="mt-2 pt-2 border-t border-gray-200">
        {isAddingCard ? (
          <form onSubmit={handleAddCardSubmit} className="space-y-2">
            <input
              type="text"
              placeholder="Enter card title..."
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              autoFocus
              className="w-full text-sm p-2 border border-indigo-400 rounded focus:outline-none bg-white"
            />
            <div className="flex items-center space-x-2">
              <button
                type="submit"
                className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded hover:bg-indigo-700 font-medium"
              >
                Add Card
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCard(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            className="w-full text-left text-xs font-medium text-gray-600 hover:bg-gray-200 p-2 rounded transition-colors"
          >
            + Add a card
          </button>
        )}
      </div>
    </div>
  );
};

export default List;
