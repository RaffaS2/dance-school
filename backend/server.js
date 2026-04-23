require('dotenv').config()

const express = require('express')
const app = express() //cria a app
const pool = require('./db')
const userRouter = require('./routes/users')

const cors = require('cors') //permite que o backend num dominio diferente acesse o frontend
const cookieParser = require('cookie-parser') //"middleman" que ajuda o express a ler os cookies
const authRoutes = require('./routes/auth') // importa as routes da parte de autenticação

// ─── 1. MIDDLEWARES

app.use(express.json()) //permite que o SV leia JSON no corpo dos pedidos

app.use(cookieParser()) //prepara o server para ler os cookies que o browser envia

app.use(cors({ //permissão para o back falar com o front
  origin: 'http://localhost:3000', // URL do frontend
  credentials: true               // true para enviar os cookies
}))

// ─── 2. ROTAS

app.get('/', (req, res) =>{ // cria uma rota GET que devolve uma msg
    res.json({ message: 'hello backend'})
})

app.use('/users', userRouter)

app.use('/api/auth', authRoutes) // rotas de autenticação

// Rota GET para testar a ligação à base de dados
app.get('/test-db', async (req, res) => {
  try {
    // Faz uma query simples que devolve a hora atual do servidor da base de dados
    const result = await pool.query('SELECT NOW()')
    // Se a query correr bem, devolve connected: true e a hora do servidor
    res.json({ connected: true, time: result.rows[0].now })
  } catch (error) {
    // Se houver algum erro (ex: credenciais erradas, sem ligação), devolve o erro
    res.json({ connected: false, error: error.message })
  }
})

// ─── 3. LISTEN

app.listen(3001, () => { //sv corre na porta 3001, porque o frontend ta a usar 3000
    console.log('running server on port 3001')
})
