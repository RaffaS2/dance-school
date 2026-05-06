require('dotenv').config() // carrega as variáveis do .env (JWT_SECRET, DATABASE_URL, etc)

const express = require('express')
const app = express() // cria a app
const pool = require('./db')
const cors = require('cors') // permite que o backend num dominio diferente acesse o frontend
const cookieParser = require('cookie-parser') // "middleman" que ajuda o express a ler os cookies


app.use(cors({ // permissão para o back falar com o front
  origin: 'http://localhost:3000', // URLs do frontend em dev
  credentials: true               // true para enviar os cookies
}))
app.use(express.json()) // permite que o SV leia JSON no corpo dos pedidos
app.use(cookieParser()) // prepara o server para ler os cookies que o browser envia

app.get('/', (req, res) => { // cria uma rota GET que devolve uma msg
  res.json({ message: 'hello backend' })
})

app.use('/api', require('./routes/index')) // todas as rotas centralizadas aqui

// Rota GET para testar a ligação à base de dados
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()')
    res.json({ connected: true, time: result.rows[0].now })
  } catch (error) {
    res.json({ connected: false, error: error.message })
  }
})

// Só arranca o servidor se for o ficheiro principal
// Quando os testes fazem require('./server'), o listen NÃO é chamado
if (require.main === module) {
  app.listen(3001, () => {
    console.log('running server on port 3001')
  })
}

module.exports = app // exporta o app para o Supertest usar
