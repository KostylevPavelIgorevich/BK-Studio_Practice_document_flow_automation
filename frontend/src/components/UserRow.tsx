import { useState } from 'react';

interface UserRowProps {
  user: {
    id: number;
    lastName: string;
    firstName: string;
    middleName: string;
  };
  onSelectUser: (userId: number, fullName: string) => void;
}

export function UserRow({ user, onSelectUser }: UserRowProps) {
  const [isHovered, setIsHovered] = useState(false);

  const fullName = `${user.lastName} ${user.firstName} ${user.middleName}`;

  return (
    <div
      className="grid grid-cols-3 gap-4 px-4 py-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="text-gray-700">{user.lastName}</span>
      <span className="text-gray-700">{user.firstName}</span>
      <span className="text-gray-700 flex items-center justify-between">
        <span>{user.middleName}</span>
        {isHovered && (
          <button
            onClick={() => onSelectUser(user.id, fullName)}
            className="ml-2 p-1 bg-[#2860F0] hover:bg-[#1e4bc2] rounded-full transition-all transform hover:scale-110"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </span>
    </div>
  );
}