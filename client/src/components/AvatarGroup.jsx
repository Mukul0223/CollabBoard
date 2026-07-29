import { useState, useRef, useEffect } from "react";

const AvatarGroup = ({
  members = [],
  isOwner,
  currentUserId,
  onRemoveMember,
}) => {
  const [activeMemberId, setActiveMemberId] = useState(null);
  const [isListOpen, setIsListOpen] = useState(false);
  const containerRef = useRef(null);

  const maxVisible = 5;
  const visibleMembers = members.slice(0, maxVisible);
  const extraCount = members.length - maxVisible;

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActiveMemberId(null);
        setIsListOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSingleMember = (id) => {
    setIsListOpen(false);
    setActiveMemberId((prev) => (prev === id ? null : id));
  };

  const toggleFullList = () => {
    setActiveMemberId(null);
    setIsListOpen((prev) => !prev);
  };

  return (
    <div ref={containerRef} className="flex items-center -space-x-2 relative">
      {/* 1. Visible Avatars (First 5) */}
      {visibleMembers.map((member) => {
        const memberId = member.id || member._id;
        const initial = (member.name || member.email || "U")
          .charAt(0)
          .toUpperCase();
        const isOpen = activeMemberId === memberId;

        return (
          <div key={memberId} className="relative">
            <button
              type="button"
              onClick={() => toggleSingleMember(memberId)}
              className="relative flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs border-2 border-white shadow-sm cursor-pointer hover:scale-105 hover:z-30 transition-all focus:outline-none"
              title={member.name || member.email}
            >
              {initial}
            </button>

            {/* Individual Member Quick Card */}
            {isOpen && (
              <div className="absolute top-10 left-1/2 -translate-x-1/2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-50 text-gray-800">
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-t border-l border-gray-200"></div>

                <div className="flex flex-col items-center text-center space-y-1 relative z-10">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                    {initial}
                  </div>
                  <p className="font-semibold text-xs text-gray-900 truncate max-w-full">
                    {member.name || "User"}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate max-w-full">
                    {member.email}
                  </p>

                  {isOwner && memberId !== currentUserId && (
                    <button
                      onClick={() => {
                        onRemoveMember(memberId);
                        setActiveMemberId(null);
                      }}
                      className="mt-2 w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs py-1 px-2 rounded font-medium transition-colors cursor-pointer"
                    >
                      Remove from board
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* 2. Overflow Badge (+N) - Opens Full Member List */}
      {extraCount > 0 && (
        <button
          type="button"
          onClick={toggleFullList}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-bold text-xs border-2 border-white shadow-sm hover:bg-gray-300 cursor-pointer transition-colors focus:outline-none z-10"
          title="View all members"
        >
          +{extraCount}
        </button>
      )}

      {/* 3. Full Members List Modal / Dropdown */}
      {isListOpen && (
        <div className="absolute top-10 right-0 w-72 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 text-gray-800 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
            <span className="font-semibold text-xs text-gray-700">
              Board Members ({members.length})
            </span>
            <button
              onClick={() => setIsListOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>

          {/* Scrollable Members List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
            {members.map((member) => {
              const memberId = member.id || member._id;
              const initial = (member.name || member.email || "U")
                .charAt(0)
                .toUpperCase();

              return (
                <div
                  key={memberId}
                  className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">
                        {member.name || "User"}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  {/* Remove Button for Owner */}
                  {isOwner && memberId !== currentUserId && (
                    <button
                      onClick={() => onRemoveMember(memberId)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 text-[11px] font-medium px-2 py-1 rounded transition-colors cursor-pointer shrink-0"
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarGroup;
