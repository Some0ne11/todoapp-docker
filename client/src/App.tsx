import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { type Todo, TodoItem } from './components/TodoItem';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTodos = async () => {
    try {
      const res = await fetch(`${API_URL}/todos`);
      if (res.ok) {
        const data = await res.json();
        setTodos(data);
      }
    } catch (error) {
      console.error("Failed to fetch todos", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    // Optimistic UI update
    const tempId = Date.now();
    const newTodo: Todo = {
      id: tempId,
      title: newTitle,
      completed: false,
      created_at: new Date().toISOString()
    };
    
    setTodos(prev => [newTodo, ...prev]);
    setNewTitle('');
    
    try {
      await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      });
      // Re-fetch after actual addition to get true ID from DB
      fetchTodos();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggle = async (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    try {
      await fetch(`${API_URL}/todos/${id}/toggle`, { method: 'PUT' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    setTodos(todos.filter(t => t.id !== id));
    try {
      await fetch(`${API_URL}/todos/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error(error);
    }
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
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
