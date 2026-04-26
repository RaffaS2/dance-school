// CRUD COMPLETO - CREATE, READ, UPDATE E DELETE

const pool = require('../db')

// cria o item
const createItem = async (req, res) => {
    try {
        const { name, status, id_category } = req.body
        const result = await pool.query(
            'INSERT INTO items (name, status, id_category) VALUES ($1, $2, $3) RETURNING *',
            [name, status, id_category]
        )
        res.status(201).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// lê todos os itens
const readAllItems = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM items')
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// lê o item pelo id
const readItemById = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('SELECT * FROM items WHERE id_item = $1', [id])
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// atualiza o item pelo id
const updateItem = async (req, res) => {
    try {
        const { id } = req.params
        const { name, status, id_category } = req.body
        const result = await pool.query(
            'UPDATE items SET name = $1, status = $2, id_category = $3 WHERE id_item = $4 RETURNING *',
            [name, status, id_category, id]
        )
        res.status(200).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// elimina o item pelo id
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query(
            'DELETE FROM items WHERE id_item = $1 RETURNING *',
            [id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Item não encontrado.' })
        }

        res.status(204).json(result.rows[0])
    } catch (error) {
        if (error.code === '23503') {
            return res.status(409).json({
                error: 'Não é possível remover este item porque existe histórico de requisições associado.'
            })
        }
        res.status(500).json({ error: error.message })
    }
}

module.exports = { createItem, readAllItems, readItemById, updateItem, deleteItem }