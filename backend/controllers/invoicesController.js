// CRUD COMPLETO - CREATE, READ, UPDATE E DELETE

const pool = require('../db')

// cria a fatura
const createInvoice = async (req, res) => {
    try {
        const { id_user, id_coaching, issue_date, amount, paid } = req.body
        const result = await pool.query(
            'INSERT INTO invoices (id_user, id_coaching, issue_date, amount, paid) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [id_user, id_coaching, issue_date, amount, paid]
        )
        res.status(201).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// lê todas as faturas 
const readAllInvoices = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM invoices')
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// lê a fatura pelo id
const readInvoiceById = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('SELECT * FROM invoices WHERE id_invoice = $1', [id])
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// atualiza a fatura pelo id
const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params
        const { id_user, id_coaching, issue_date, amount, paid } = req.body
        const result = await pool.query(
            'UPDATE invoices SET id_user = $1, id_coaching = $2, issue_date = $3, amount = $4, paid = $5 WHERE id_invoice = $6 RETURNING *',
            [id_user, id_coaching, issue_date, amount, paid, id]
        )
        res.status(200).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// elimina a fatura pelo id
const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query(
            'DELETE FROM invoices WHERE id_invoice = $1 RETURNING *',
            [id]
        )
        res.status(204).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { createInvoice, readAllInvoices, readInvoiceById, updateInvoice, deleteInvoice }