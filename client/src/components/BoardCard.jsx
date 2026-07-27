import { useNavigate } from "react-router-dom";

const BoardCard = ({ board }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/board/${board._id}`)}
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-500 transition-all cursor-pointer flex flex-col justify-between h-36"
    >
      <div>
        <h3 className="text-lg font-bold text-gray-800 truncate">
          {board.title}
        </h3>
        {board.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {board.description}
          </p>
        )}
      </div>
      <div className="text-xs text-indigo-600 font-medium">
        View Board &rarr;
      </div>
    </div>
  );
};

export default BoardCard;
