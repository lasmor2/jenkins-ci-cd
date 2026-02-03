import Todo from '../models/Todo.js'

export const addTodo = async (req, res) => {
  try {
    console.log('Request body:', req.body)
    const { text } = req.body
    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }
    const todo = new Todo({ text })
    const savedTodo = await todo.save()
    console.log('Todo saved:', savedTodo)
    res.status(201).json(savedTodo)
  } catch (error) {
    console.error('Add todo error:', error)
    res.status(400).json({ error: error.message })
  }
}

export const removeTodo = async (req, res) => {
  try {
    const { id } = req.params
    const deletedTodo = await Todo.findByIdAndDelete(id)
    if (!deletedTodo) {
      return res.status(404).json({ error: 'Todo not found' })
    }
    res.status(200).json({ message: 'Todo deleted', todo: deletedTodo })
  } catch (error) {
    console.error('Remove todo error:', error)
    res.status(400).json({ error: error.message })
  }
}

export const getTodo = async (req, res) => {
  try {
    const { id } = req.params
    const todo = await Todo.findById(id)
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found create one' })
    }
    res.json(todo)
  } catch (error) {
    console.error('Get todo error:', error)
    res.status(400).json({ error: error.message })
  }
}

export const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find()
    console.log('Found todos:', todos.length)
    res.json(todos)
  } catch (error) {
    console.error('Get todos error:', error)
    res.status(500).json({ error: error.message })
  }
}
