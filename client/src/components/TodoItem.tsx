import { Check, Trash2 } from 'lucide-react';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div className="group flex items-center justify-between p-4 mb-3 rounded-2xl glass transition-all hover:scale-[1.02] hover:shadow-2xl">
      <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => onToggle(todo.id)}>
        <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors ${
          todo.completed 
            ? 'bg-brand-500 border-brand-500 text-white' 
            : 'border-slate-500'
        }`}>
          {todo.completed && <Check size={14} strokeWidth={3} />}
        </div>
        <span className={`text-lg transition-all duration-300 ${
          todo.completed ? 'line-through text-slate-500' : 'text-slate-100'
        }`}>
          {todo.title}
        </span>
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(todo.id); }}
        className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:bg-rose-900/30 rounded-full transition-all focus:opacity-100"
        aria-label="Delete todo"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
