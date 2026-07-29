import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import Card from "./Card";

const List = ({
  list,
  index,
  cards = [],
  onAddCard,
  onCardClick,
  onDeleteCard,
  onDeleteList,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [cardTitle, setCardTitle] = useState("");

  const listId = list.id || list._id;

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!cardTitle.trim()) return;
    onAddCard(listId, cardTitle.trim());
    setCardTitle("");
    setIsAdding(false);
  };

  return (
    <Draggable draggableId={listId} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="w-72 bg-gray-100/80 rounded-xl p-3 flex flex-col max-h-full shrink-0 border border-gray-200"
        >
          {/* List Header (Drag Handle) */}
          <div
            {...provided.dragHandleProps}
            className="flex items-center justify-between mb-3 px-1 cursor-grab active:cursor-grabbing"
          >
            <h3 className="font-semibold text-sm text-gray-700 truncate">
              {list.title}
            </h3>
            <button
              type="button"
              onClick={() => onDeleteList?.(listId)}
              className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1 text-xs rounded transition-colors cursor-pointer"
              title="Delete List"
              aria-label="Delete List"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Cards Droppable Drop Zone */}
          <Droppable droppableId={listId} type="CARD">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 overflow-y-auto px-0.5 min-h-12 transition-colors rounded-lg ${
                  snapshot.isDraggingOver ? "bg-indigo-50/50" : ""
                }`}
              >
                {cards.map((card, cardIndex) => (
                  <Card
                    key={card.id || card._id}
                    card={card}
                    index={cardIndex}
                    onClick={onCardClick}
                    onDelete={onDeleteCard}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Add Card Footer */}
          <div className="mt-2">
            {isAdding ? (
              <form onSubmit={handleAddSubmit} className="space-y-2">
                <textarea
                  placeholder="Enter a title for this card..."
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  autoFocus
                  className="w-full text-sm p-2 border border-indigo-400 rounded focus:outline-none bg-white resize-none shadow-sm"
                  rows={2}
                />
                <div className="flex items-center space-x-2">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded hover:bg-indigo-700 font-medium cursor-pointer"
                  >
                    Add Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAdding(true)}
                className="w-full text-left text-xs font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-200/60 p-2 rounded-md transition-colors cursor-pointer"
              >
                + Add a card
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default List;
