import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import connectDB from './config/database.js'
import todoRoutes from './routes/todoRoutes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '..', '.env') })

const app = express()
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}))
app.use(express.json())

const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send('Hello, Jenkins CI/CD!')
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.use('/api/todos', todoRoutes)

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`)
  console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Loaded' : 'Not loaded')
  
  try {
    await connectDB()
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)
    // Don't exit the process, let health checks handle it
  }
})
