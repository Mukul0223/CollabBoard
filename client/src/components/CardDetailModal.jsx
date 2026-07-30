import { useState } from "react";
import Modal from "./Modal";

const CardDetailModal = ({
  isOpen,
  onClose,
  card,
  onUpdateCard,
  onDeleteCard,
}) => {
  if (!card) return null;

  return (
    <CardDetailForm
      key={card.id || card._id} // Key forces React to remount state automatically when card changes
      isOpen={isOpen}
      onClose={onClose}
      card={card}
      onUpdateCard={onUpdateCard}
      onDeleteCard={onDeleteCard}
    />
  );
};

const CardDetailForm = ({
  isOpen,
  onClose,
  card,
  onUpdateCard,
  onDeleteCard,
}) => {
  const cardId = card.id || card._id;

  // Initialize state directly from props (no useEffect needed!)
  const [title, setTitle] = useState(card.title || "");
  const [description, setDescription] = useState(card.description || "");
  const [dueDate, setDueDate] = useState(
    card.dueDate ? new Date(card.dueDate).toISOString().split("T")[0] : "",
  );
  const [labelText, setLabelText] = useState("");
  const [labels, setLabels] = useState(card.labels || []);
  const [saving, setSaving] = useState(false);

  const handleAddLabel = () => {
    if (!labelText.trim()) return;
    if (!labels.includes(labelText.trim())) {
      setLabels([...labels, labelText.trim()]);
    }
    setLabelText("");
  };

  const handleRemoveLabel = (labelToRemove) => {
    setLabels(labels.filter((l) => l !== labelToRemove));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onUpdateCard(cardId, {
      title,
      description,
      dueDate: dueDate || null,
      labels,
    });
    setSaving(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Card Details">
      <form onSubmit={handleSave} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Card Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-200 focus:outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a more detailed description..."
            className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-200 focus:outline-none resize-none"
          />
        </div>

        {/* Labels */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Labels
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {labels.map((label, index) => (
              <span
                key={index}
                className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-md flex items-center gap-1 font-medium"
              >
                {label}
                <button
                  type="button"
                  onClick={() => handleRemoveLabel(label)}
                  className="text-indigo-400 hover:text-indigo-900 font-bold ml-1"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              placeholder="e.g. Bug, Feature, Urgent"
              className="flex-1 p-1.5 text-xs border border-gray-300 rounded focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddLabel}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded font-medium cursor-pointer"
            >
              Add Label
            </button>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-200 focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Delete this card?")) {
                onDeleteCard(cardId);
                onClose();
              }
            }}
            className="text-red-600 hover:text-red-700 text-xs font-medium cursor-pointer"
          >
            Delete Card
          </button>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-1.5 rounded font-medium disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CardDetailModal;
