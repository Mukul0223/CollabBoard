import AvatarGroup from "./AvatarGroup";

const BoardHeader = ({
  currentBoard,
  isOwner,
  currentUserId,
  onInviteClick,
  onDeleteBoard,
  onRemoveMember,
}) => {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {currentBoard?.title || "Board"}
        </h1>
        {currentBoard?.description && (
          <p className="text-sm text-gray-500">{currentBoard.description}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Google Docs Style Member Avatar Stack */}
        <AvatarGroup
          members={currentBoard?.members}
          isOwner={isOwner}
          currentUserId={currentUserId}
          onRemoveMember={onRemoveMember}
        />

        {/* Owner Action Buttons */}
        {isOwner && (
          <>
            <button
              onClick={onInviteClick}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer"
            >
              + Invite Member
            </button>

            <button
              onClick={onDeleteBoard}
              className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer"
            >
              Delete Board
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BoardHeader;
