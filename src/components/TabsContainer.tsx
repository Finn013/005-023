import React from 'react';
import { X, Plus } from 'lucide-react';
import { Note } from '../types';

interface TabsContainerProps {
  notes: Note[];
  currentNoteId: string | null;
  onSwitchNote: (noteId: string) => void;
  onDeleteTab: (noteId: string) => void;
  onAddTab: () => void;
}

export const TabsContainer: React.FC<TabsContainerProps> = ({
  notes,
  currentNoteId,
  onSwitchNote,
  onDeleteTab,
  onAddTab,
}) => {
  return (
    <div className="bg-gray-300 px-4 border-b border-gray-400 relative z-50">
      <div className="flex gap-0 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400">
        {notes.map((note) => (
          <div
            key={note.id}
            className={`
              relative px-6 py-2 cursor-pointer font-medium text-sm
              transition-all duration-200 min-w-0 flex-shrink-0
              border border-gray-500 border-b-0 mr-[-12px]
              ${note.id === currentNoteId 
                ? 'bg-white text-gray-800 z-10 border-b border-white' 
                : 'bg-gray-400 text-white hover:bg-gray-500'
              }
            `}
            style={{
              clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 100%, 0 100%)',
              minWidth: window.innerWidth < 768 ? '90px' : '120px'
            }}
            onClick={() => onSwitchNote(note.id)}
          >
            <span className="truncate block pr-4 max-w-20 md:max-w-24">
              {note.title}
            </span>
            {notes.length > 1 && (
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 
                         w-4 h-4 rounded-full flex items-center justify-center
                         hover:bg-gray-200 hover:bg-opacity-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTab(note.id);
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
        
        {/* Кнопка добавления новой вкладки */}
        <button
          onClick={onAddTab}
          className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white 
                   border border-gray-500 border-b-0 transition-colors duration-200
                   flex items-center justify-center min-w-[40px]"
          title="Добавить новую вкладку"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};