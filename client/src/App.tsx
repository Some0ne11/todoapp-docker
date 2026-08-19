import { useState } from 'react';
import { Plus } from 'lucide-react';
import { TodoItem } from './components/TodoItem';
import { useTodos } from './hooks/useTodos';

function App() {
  const [newTitle, setNewTitle] = useState('');
  const { todos, loading, addTodo, toggleTodo, deleteTodo } = useTodos();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    await addTodo(newTitle);
    setNewTitle('');
  };

  return (
    <div className="min-h-screen py-10 px-4 transition-colors duration-300 bg-slate-900 text-slate-50">
      <div className="max-w-2xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-brand-500">
            Tasks
          </h1>
        </header>

        <form onSubmit={handleAdd} className="mb-8 relative group">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full p-4 pr-14 rounded-2xl glass bg-slate-800/50 outline-none focus:ring-2 focus:ring-brand-500 transition-all text-lg placeholder:text-slate-400 text-slate-50"
          />
          <button 
            type="submit" 
            disabled={!newTitle.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-brand-500 hover:scale-105 active:scale-95"
            aria-label="Add todo"
          >
            <Plus size={24} />
          </button>
        </form>

        {loading ? (
          <div className="text-center text-slate-400 py-10 animate-pulse">
            Loading tasks...
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center text-slate-400 py-10 glass rounded-2xl">
            You're all caught up! ✨
          </div>
        ) : (
          <div className="space-y-1">
            {todos.map(todo => (
              <TodoItem 
                key={todo.id} 
                todo={todo} 
                onToggle={toggleTodo}
                onDelete={deleteTodo}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
