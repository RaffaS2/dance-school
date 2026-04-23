// CRUD COMPLETO - CREATE, READ, UPDATE E DELETE
const pool = require('../db')

// cria a categoria do item
const createCategory = async (req, res) => {
    try {
        const { name } = req.body
        const result = await pool.query(
            'INSERT INTO categories (name) VALUES ($1) RETURNING *',
            [name]
        )
        res.status(201).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// lê todas as categorias dos itens
const readAllCategories = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories')
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// lê a categoria do item por id
const readCategoryById = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('SELECT * FROM categories WHERE id_category = $1', [id])
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// atualiza a categoria do item por id
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params
        const { name } = req.body
        const result = await pool.query(
            'UPDATE categories SET name = $1 WHERE id_category = $2 RETURNING *',
            [name, id]
        )
        res.status(200).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// elimina a categoria do item por id
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query(
            'DELETE FROM categories WHERE id_category = $1 RETURNING *',
            [id]
        )
        res.status(204).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { createCategory, readAllCategories, readCategoryById, updateCategory, deleteCategory }