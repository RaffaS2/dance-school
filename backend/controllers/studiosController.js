// CRUD COMPLETO - CREATE, READ, UPDATE E DELETE

const pool = require('../db')

// cria o estúdio
const createStudio = async (req, res) => {
    try {
        const { name, max_capacity } = req.body
        const result = await pool.query(
            'INSERT INTO studios (name, max_capacity) VALUES ($1, $2) RETURNING *',
            [name, max_capacity]
        )
        res.status(201).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// lê todos os estúdios
const readAllStudios = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM studios')
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// lê o estúdio pelo id
const readStudioById = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('SELECT * FROM studios WHERE id_studio = $1', [id])
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// atualiza o estúdio pelo id
const updateStudio = async (req, res) => {
    try {
        const { id } = req.params
        const { name, max_capacity, active } = req.body
        const result = await pool.query(
            'UPDATE studios SET name = $1, max_capacity = $2, active = $3 WHERE id_studio = $4 RETURNING *',
            [name, max_capacity, active, id]
        )
        res.status(200).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// elimina o estúdio pelo id
const deleteStudio = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query(
            'DELETE FROM studios WHERE id_studio = $1 RETURNING *',
            [id]
        )
        res.status(204).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { createStudio, readAllStudios, readStudioById, updateStudio, deleteStudio }