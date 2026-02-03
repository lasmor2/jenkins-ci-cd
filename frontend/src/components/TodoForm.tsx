interface TodoFormProps {
  onAddTodo: (text: string) => void
}

export default function TodoForm({ onAddTodo }: TodoFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const text = formData.get('todo') as string
    if (text.trim()) {
      onAddTodo(text.trim())
      e.currentTarget.reset()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <input
        type="text"
        name="todo"
        placeholder="Add a new todo..."
        className="todo-input"
        required
      />
      <button type="submit" className="add-btn">Add</button>
    </form>
  )
}