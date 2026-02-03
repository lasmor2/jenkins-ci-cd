import TodoItem from './TodoItem'
import type { Todo } from '../types'

interface TodoListProps {
  todos: Todo[]
  onDelete: (id: string) => void
}

export default function TodoList({ todos, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return <p className="no-todos">No todos yet. Add one above!</p>
  }

  return (
    <div className="todos">
      {todos.map(todo => (
        <TodoItem 
          key={todo._id} 
          todo={todo} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  )
}