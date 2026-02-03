import express from 'express'
import {
  addTodo,
  removeTodo,
  getTodos,
  getTodo,
} from '../controller/todoController.js'

const router = express.Router()

router.get('/', getTodos)
router.get('/:id', getTodo)
router.post('/', addTodo)
router.delete('/:id', removeTodo)

export default router
