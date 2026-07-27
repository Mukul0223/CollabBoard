import { useParams } from "react-router-dom";

const BoardPage = () => {
  const { boardId } = useParams();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Board: {boardId}
      </h1>
      <div className="bg-white p-6 rounded-lg shadow text-gray-500">
        [Kanban Board Canvas Placeholder]
      </div>
    </div>
  );
};

export default BoardPage;
