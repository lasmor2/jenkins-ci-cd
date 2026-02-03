import type { Todo } from '../types'

interface TodoItemProps {
  todo: Todo
  onDelete: (id: string) => void
}

export default function TodoItem({ todo, onDelete }: TodoItemProps) {
  return (
    <div className="todo-item">
      <span className="todo-text">{todo.text}</span>
      <button 
        onClick={() => onDelete(todo._id)}
        className="delete-btn"
      >
        Delete
      </button>
    </div>
  )
}