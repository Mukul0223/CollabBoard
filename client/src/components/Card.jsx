const Card = ({ card, onClick }) => {
  return (
    <div
      onClick={() => onClick && onClick(card)}
      className="bg-white p-3 rounded-md shadow-sm border border-gray-200 hover:border-indigo-400 transition-all cursor-pointer mb-2 space-y-2"
    >
      <p className="text-sm font-medium text-gray-800 wrap-break-word">
        {card.title}
      </p>

      {/* Optional Metadata: Labels, Due Date, & Description Indicator */}
      <div className="flex flex-wrap items-center gap-1.5">
        {card.labels?.map((label, index) => (
          <span
            key={index}
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
        {card.description && (
          <span
            className="text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1"
            title="This card has a description"
          >
            📄
          </span>
        )}
      </div>
    </div>
  );
};

export default Card;
