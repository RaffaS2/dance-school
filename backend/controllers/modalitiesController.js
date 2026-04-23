// CRUD COMPLETO - CREATE, READ, UPDATE E DELETE

const pool = require('../db')

// cria a modalidade
const createModality = async (req, res) => {
    try {
        const { name, description } = req.body
        const result = await pool.query(
            'INSERT INTO modalities (name, description) VALUES ($1, $2) RETURNING *',
            [name, description]
        )
        res.status(201).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// lê todas as modalidades
const readAllModalities = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM modalities')
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// lê a modalidade por id
const readModalityById = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('SELECT * FROM modalities WHERE id_modality = $1', [id])
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// atualiza a modalidade pelo id
const updateModality = async (req, res) => {
    try {
        const { id } = req.params
        const { name, description } = req.body
        const result = await pool.query(
            'UPDATE modalities SET name = $1, description = $2 WHERE id_modality = $3 RETURNING *',
            [name, description, id]
        )
        res.status(200).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// elimina a modalidade pelo id
const deleteModality = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query(
            'DELETE FROM modalities WHERE id_modality = $1 RETURNING *',
            [id]
        )
        res.status(204).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { createModality, readAllModalities, readModalityById, updateModality, deleteModality }