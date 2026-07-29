import { Trash2 } from "lucide-react";
import { Draggable } from "@hello-pangea/dnd";

const Card = ({ card, index, onClick, onDelete }) => {
  const cardId = card.id || card._id;

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(cardId);
  };

  return (
    <Draggable draggableId={cardId} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick && onClick(card)}
          className={`group relative bg-white p-3 rounded-md border border-gray-200 hover:border-indigo-400 transition-all cursor-grab active:cursor-grabbing mb-2 space-y-2 ${
            snapshot.isDragging
              ? "shadow-lg ring-2 ring-indigo-500/50 z-50"
              : "shadow-sm"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-gray-800 wrap-break-words flex-1">
              {card.title}
            </p>
            <button
              type="button"
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 hover:bg-red-50 active:scale-95 transition-all duration-150 p-1.5 rounded-md cursor-pointer"
              title="Delete Card"
              aria-label="Delete Card"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {card.labels?.map((label, i) => (
              <span
                key={i}
                className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded"
              >
                {label}
              </span>
            ))}
            {card.dueDate && (
              <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                📅 {new Date(card.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default Card;
