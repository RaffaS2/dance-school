const express = require('express')
const app = express() //cria a app
const pool = require('./db')

app.use(express.json()) //permite que o SV leia JSON no corpo dos pedidos

app.get('/', (req, res) =>{ // cria uma rota GET que devolve uma msg
    res.json({ message: 'hello backend'})

})

app.use('/', require('./routes/index'))

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

app.listen(3001, () => { //sv corre na porta 3001, porque o frontend ta a usar 3000
    console.log('running server on port 3001')
})