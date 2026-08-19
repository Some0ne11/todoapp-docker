import { useState, useEffect, useCallback } from 'react';
import { type Todo } from '../components/TodoItem';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/todos`);
      if (res.ok) {
        const data = await res.json();
        setTodos(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch todos", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = async (title: string) => {
    // Optimistic UI update
    const tempId = Date.now();
    const newTodo: Todo = {
      id: tempId,
      title,
      completed: false,
      created_at: new Date().toISOString()
    };
    
    setTodos(prev => [newTodo, ...prev]);
    
    try {
      await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      // Re-fetch after actual addition to get true ID from DB
      fetchTodos();
    } catch (error) {
      console.error("Failed to add todo", error);
    }
  };

  const toggleTodo = async (id: number) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    try {
      await fetch(`${API_URL}/todos/${id}/toggle`, { method: 'PUT' });
    } catch (error) {
      console.error("Failed to toggle todo", error);
    }
  };

  const deleteTodo = async (id: number) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    try {
      await fetch(`${API_URL}/todos/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error("Failed to delete todo", error);
    }
  };

  return {
    todos,
    loading,
    addTodo,
    toggleTodo,
    deleteTodo,
  };
}
