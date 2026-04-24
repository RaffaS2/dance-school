// CRUD COMPLETO - CREATE, READ, UPDATE E DELETE

const pool = require('../db')
 
const createUser = async (req, res) => {
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
  }

// lê todos os utilizadores
const readAllUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users')
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}


// lê o utilizador pelo id
const readUserById = async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM users WHERE id_user = $1', [id])
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// atualiza o utilizador pelo id
const updateUser = async (req, res) => {
    try{
      const { id } = req.params
      const { name, email, phone_number, id_user_type } = req.body
      const result = await pool.query(
        'UPDATE users SET name = $1, email = $2, phone_number = $3, id_user_type = $4 WHERE id_user = $5 RETURNING *',
        [name, email, phone_number, id_user_type, id]
      )
      res.status(200).json(result.rows[0])
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }


// elimina o utilizador pelo id
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query(
            'DELETE FROM users WHERE id_user = $1 RETURNING *',
            [id]
        )
        res.status(204).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { createUser, readAllUsers, readUserById, updateUser, deleteUser }
