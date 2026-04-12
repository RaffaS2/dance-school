const express = require('express')
const router = express.Router() // usamos um router separado para cada tabela, assim é mais facil de ir buscar os dados todos da tabela
const pool = require('../db')

//Buscar todos os users
router.get('/', async (req, res) => {
    try{
        const result = await pool.query('SELECT * FROM users')
        res.json(result.rows)
    } catch(error){
        res.status(500).json({error: error.message})
    }
})

//Buscar um utilizador por um id em especifico
router.get('/:id', async (req, res) => {
    try{
        const {id} = req.params
        const result = await pool.query('SELECT * FROM users WHERE id_user = $1' [id])

        res.json(result.rows)
    } catch(error){
        res.status(500).json({error: error.message})
    }
})

//Criar um utilizador
router.post('/', async (req, res) => {
  try {
    const { name, email, phone_number, id_user_type } = req.body
    const result = await pool.query(
      'INSERT INTO users (name, email, phone_number, id_user_type) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, phone_number, id_user_type]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router

//teste de commit Nuno