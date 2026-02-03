import { useState, useEffect, useCallback } from 'react'
import TodoForm from './components/TodoForm'
import TodoList from './components/TodoList'
import type { Todo } from './types'
import './App.css'

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/todos'

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch(API_URL)
      if (response.ok) {
        const data = await response.json()
        setTodos(data)
      } else {
        setError(`Failed to fetch todos: ${response.status} ${response.statusText}`)
      }
    } catch (err) {
      setError(`Failed to fetch todos: ${err instanceof Error ? err.message : 'Unknown error'}`)
      console.error('Fetch todos error:', err)
    } finally {
      setLoading(false)
    }
  }, [API_URL])

  const addTodo = useCallback(async (text: string) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (response.ok) {
        const todo = await response.json()
        setTodos(prev => [...prev, todo])
        setError('')
      } else {
        setError(`Failed to add todo: ${response.status} ${response.statusText}`)
      }
    } catch (err) {
      setError(`Failed to add todo: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }, [API_URL])

  const deleteTodo = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setTodos(prev => prev.filter(todo => todo._id !== id))
        setError('')
      } else {
        setError(`Failed to delete todo: ${response.status} ${response.statusText}`)
      }
    } catch (err) {
      setError(`Failed to delete todo: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }, [API_URL])

  return (
    <div className="app">
      <h1>Todo App</h1>
      <TodoForm onAddTodo={addTodo} />
      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Loading...</div>}
      <TodoList todos={todos} onDelete={deleteTodo} />
    </div>
  )
}

export default App

